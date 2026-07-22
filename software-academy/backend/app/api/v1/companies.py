"""
Эндпоинты Companies (только master):

- POST /api/company/      создать компанию-клиента
- GET  /api/companies/    список компаний
- GET  /api/user/company/ своя компания (любой залогиненный)
"""

from fastapi import APIRouter, Depends, HTTPException, status

from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.api.v1.deps import get_current_user, require_privileged
from app.schemas.company import CompanyCreateIn, CompanyOut
from app.services import company_service

router = APIRouter()


def _require_master(actor: User) -> None:
    if actor.role.key != "master":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Master only"
        )


@router.post(
    "/company/", response_model=CompanyOut, status_code=status.HTTP_201_CREATED, tags=["companies"]
)
def create_company(
    body: CompanyCreateIn,
    db: Session = Depends(get_db),
    actor: User = Depends(require_privileged),
) -> CompanyOut:
    """Создать компанию-клиента. Access: master."""
    _require_master(actor)
    company = company_service.create_company(
        db, name=body.name, businessid=body.businessid, email=body.email
    )
    return CompanyOut.model_validate(company)


@router.get("/companies/", response_model=list[CompanyOut], tags=["companies"])
def list_companies(
    db: Session = Depends(get_db),
    actor: User = Depends(require_privileged),
) -> list[CompanyOut]:
    """Все компании. Access: master."""
    _require_master(actor)
    return [CompanyOut.model_validate(c) for c in company_service.list_companies(db)]


@router.get("/user/company/", response_model=CompanyOut, tags=["companies"])
def my_company(actor: User = Depends(get_current_user)) -> CompanyOut:
    """Своя компания. Access: любой залогиненный (как в Welding Log)."""
    return CompanyOut.model_validate(actor.company)
