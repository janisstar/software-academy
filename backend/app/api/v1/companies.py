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
from app.schemas.company import CompanyCreateIn, CompanyOut, build_company_out
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
    return build_company_out(company, company_service.count_users(db, company.id))


@router.get("/companies/", response_model=list[CompanyOut], tags=["companies"])
def list_companies(
    db: Session = Depends(get_db),
    actor: User = Depends(require_privileged),
) -> list[CompanyOut]:
    """Все компании. Access: master."""
    _require_master(actor)
    return [
        build_company_out(company, users_count)
        for company, users_count in company_service.list_companies_with_user_counts(db)
    ]


@router.get("/user/company/", response_model=CompanyOut, tags=["companies"])
def my_company(
    db: Session = Depends(get_db),
    actor: User = Depends(get_current_user),
) -> CompanyOut:
    """Своя компания. Access: любой залогиненный (как в Welding Log)."""
    return build_company_out(
        actor.company, company_service.count_users(db, actor.company_id)
    )
