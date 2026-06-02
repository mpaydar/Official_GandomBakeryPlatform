from uuid import UUID

from pydantic import BaseModel


class users(BaseModel):
    id: UUID
    email: str
    name: str
    role: str
    hashed_pw: str
    is_active: bool
    created_at: str


class orders(BaseModel):
    id: UUID
    customer_id: UUID
    status: str
    version: str
    requested_time: str
    confirmed_time: str
    proposed_time: str
    proposal_expir: str
    reschedule_count: int
    notes: str
    idempotency_key: str
    created_at: str
    updated_at: str
