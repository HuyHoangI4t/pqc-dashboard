import json
import time
from datetime import datetime, timezone

from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import ec, padding, rsa
from pqcrypto.kem import ml_kem_768
from pqcrypto.sign import ml_dsa_65, sphincs_sha2_128f_simple

from ..schemas import KemResult, LabResponse, SignatureResult

PQC_ALGORITHMS = ["ML-KEM-768", "ML-DSA-65", "SLH-DSA-SHA2-128f"]


def _elapsed_ms(operation):
    started = time.perf_counter()
    value = operation()
    return value, round((time.perf_counter() - started) * 1000, 3)


def _pqc_signature(module, display_name: str, payload: bytes) -> SignatureResult:
    (public_key, secret_key), keygen_ms = _elapsed_ms(module.generate_keypair)
    signature, sign_ms = _elapsed_ms(lambda: module.sign(secret_key, payload))
    verified, verify_ms = _elapsed_ms(lambda: module.verify(public_key, payload, signature))
    if not verified:
        raise RuntimeError(f"Xác minh {display_name} thất bại")
    return SignatureResult(
        algo=display_name,
        pubKey=len(public_key),
        privKey=len(secret_key),
        sigSize=len(signature),
        signMs=sign_ms,
        verifyMs=verify_ms,
        status=f"Thành công (keygen {keygen_ms} ms)",
    )


def execute_pqc_benchmark(message_str: str) -> LabResponse:
    payload = json.dumps({"message": message_str, "timestamp": datetime.now(timezone.utc).isoformat()}, ensure_ascii=False).encode("utf-8")
    signatures = []

    rsa_key, _ = _elapsed_ms(lambda: rsa.generate_private_key(public_exponent=65537, key_size=2048))
    rsa_signature, rsa_sign_ms = _elapsed_ms(lambda: rsa_key.sign(payload, padding.PKCS1v15(), hashes.SHA256()))
    _, rsa_verify_ms = _elapsed_ms(lambda: rsa_key.public_key().verify(rsa_signature, payload, padding.PKCS1v15(), hashes.SHA256()))
    signatures.append(SignatureResult(algo="RSA-2048", pubKey=256, privKey=256, sigSize=len(rsa_signature), signMs=rsa_sign_ms, verifyMs=rsa_verify_ms, status="Thành công (baseline)"))

    ecdsa_key, _ = _elapsed_ms(lambda: ec.generate_private_key(ec.SECP256R1()))
    ecdsa_signature, ecdsa_sign_ms = _elapsed_ms(lambda: ecdsa_key.sign(payload, ec.ECDSA(hashes.SHA256())))
    _, ecdsa_verify_ms = _elapsed_ms(lambda: ecdsa_key.public_key().verify(ecdsa_signature, payload, ec.ECDSA(hashes.SHA256())) )
    signatures.append(SignatureResult(algo="ECDSA P-256", pubKey=65, privKey=32, sigSize=len(ecdsa_signature), signMs=ecdsa_sign_ms, verifyMs=ecdsa_verify_ms, status="Thành công (baseline)"))

    pqc_error = None
    try:
        signatures.extend([
            _pqc_signature(ml_dsa_65, "ML-DSA-65", payload),
            _pqc_signature(sphincs_sha2_128f_simple, "SLH-DSA-SHA2-128f", payload),
        ])
        (kem_public, kem_secret), _ = _elapsed_ms(ml_kem_768.generate_keypair)
        (ciphertext, shared_server), encap_ms = _elapsed_ms(lambda: ml_kem_768.encrypt(kem_public))
        shared_client, decap_ms = _elapsed_ms(lambda: ml_kem_768.decrypt(kem_secret, ciphertext))
        kem = KemResult(algo="ML-KEM-768", pubKey=len(kem_public), privKey=len(kem_secret), ciphertext=len(ciphertext), sharedSecret=len(shared_client), encapMs=encap_ms, decapMs=decap_ms, status="Khớp 100% (khóa dùng chung)" if shared_client == shared_server else "Không khớp")
        pqc_available = True
    except Exception as error:
        kem = None
        pqc_available = False
        pqc_error = f"Benchmark PQC thất bại: {error}"

    return LabResponse(signatures=signatures, kem=kem, pqcAvailable=pqc_available, pqcAlgorithms=PQC_ALGORITHMS if pqc_available else [], pqcError=pqc_error)
