from dataclasses import dataclass
from datetime import datetime

@dataclass
class RefreshToken:
    id: str
    user_id: int
    token_hash: str
    family_id: str
    device_id: str
    ip: str
    user_agent: str
    created_at: datetime
    expires_at: datetime
    revoked: bool = False
