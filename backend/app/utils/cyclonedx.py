import uuid
from datetime import datetime, timezone
from typing import List
from ..schemas import CbomItem

def generate_cyclonedx_cbom(items: List[CbomItem]) -> dict:
    components = []
    for item in items:
        algo_u = item.algo.upper()
        
        # Xác định primitive và nist level sơ bộ theo chuẩn Crypto Extension
        if any(k in algo_u for k in ["RSA", "ECDSA", "ECDH", "ECC"]):
            primitive = "public-key"
            quantum_level = 0
        elif any(k in algo_u for k in ["ML-KEM", "ML-DSA", "SLH-DSA"]):
            primitive = "pqc"
            quantum_level = 3 if "768" in algo_u or "65" in algo_u else 5
        elif "AES" in algo_u:
            primitive = "symmetric"
            quantum_level = 1 if "128" in algo_u else 5
        else:
            primitive = "other"
            quantum_level = 0

        comp = {
            "type": "cryptographic-asset",
            "bom-ref": f"cbom-{item.id}",
            "name": item.system,
            "description": item.purpose,
            "cryptoProperties": {
                "assetType": "algorithm",
                "algorithmProperties": {
                    "primitive": primitive,
                    "parameterSetIdentifier": item.algo,
                    "executionEnvironment": "software-unspecified",
                    "cryptoFunctions": ["sign", "verify"] if "DSA" in algo_u or "RSA" in algo_u else ["encapsulate", "decapsulate"] if "KEM" in algo_u else ["encrypt", "decrypt"],
                    "nistQuantumSecurityLevel": quantum_level
                }
            },
            "properties": [
                {"name": "cbom:dataType", "value": item.dataType},
                {"name": "cbom:retentionPeriod", "value": item.retention},
                {"name": "cbom:priority", "value": item.priority or ""},
                {"name": "cbom:riskScore", "value": str(item.riskScore or 0)}
            ]
        }
        components.append(comp)

    return {
        "bomFormat": "CycloneDX",
        "specVersion": "1.6",
        "serialNumber": f"urn:uuid:{uuid.uuid4()}",
        "version": 1,
        "metadata": {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "tools": [{"vendor": "Group O", "name": "PQC Migration Advisor Engine", "version": "1.0.0"}]
        },
        "components": components
    }