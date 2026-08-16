from pydantic import BaseModel
from typing import List, Optional

class CbomItem(BaseModel):
    id: str
    system: str
    purpose: str
    algo: str
    dataType: str
    retention: str
    priority: Optional[str] = None
    recommendation: Optional[str] = None
    riskScore: Optional[int] = None

class CbomEvaluateRequest(BaseModel):
    items: List[CbomItem]

class LabRequest(BaseModel):
    message: str

class SignatureResult(BaseModel):
    algo: str
    pubKey: int
    privKey: int
    sigSize: int
    signMs: float
    verifyMs: float
    status: str

class KemResult(BaseModel):
    algo: str
    pubKey: int
    privKey: int
    ciphertext: int
    sharedSecret: int
    encapMs: float
    decapMs: float
    status: str

class LabResponse(BaseModel):
    signatures: List[SignatureResult]
    kem: Optional[KemResult] = None
    pqcAvailable: bool
    pqcAlgorithms: List[str] = []
    pqcError: Optional[str] = None

class HndlRequest(BaseModel):
    assetId: str
    system: str
    algo: str
    dataType: str
    retention: str
    protectionMode: str

class HndlResponse(BaseModel):
    payload: str
    cipherHash: str
    sigHash: str
    isLongTerm: bool
    statusMsg: str
    statusCode: str
    legacyAnalysis: str
    pqcAnalysis: str
    hndlScore: int
    riskExplanation: str
    pqcRecommendation: str
    migrationPriority: str
