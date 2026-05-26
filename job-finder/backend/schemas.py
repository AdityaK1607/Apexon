from pydantic import BaseModel

class JobBase(BaseModel):
    title: str
    company: str
    location: str
    description: str

class JobCreate(JobBase):
    pass

class JobOut(JobBase):
    id: int

    class Config:
        from_attributes = True
