import hashlib
import time
from datetime import datetime, timezone
from typing import List
from ..schemas import CbomItem

def generate_cyclonedx_cbom(items: List[CbomItem]) -> dict:
    components = []
    for item in items:
        comp = {
            "type": "cryptographic-asset",
            "bom-ref": f"cbom-{item.id}",
            "name": item.system,
            "description": item.purpose,
            "cryptoProperties": {
                "assetType": "algorithm",
                "algorithmProperties": {
                    "primitive": "public-key" if any(k in item.algo for k in ["RSA", "ECD"]) else "symmetric",
                    "parameterSetIdentifier": item.algo,
                    "executionEnvironment": "software-unspecified"
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
        "serialNumber": "urn:uuid:" + hashlib.sha256(str(time.time()).encode()).hexdigest()[:36],
        "version": 1,
        "metadata": {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "tools": [{"vendor": "Group O", "name": "PQC Migration Advisor Engine", "version": "1.0.0"}]
        },
        "components": components
    }
