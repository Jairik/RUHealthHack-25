''' Pydantic models for the backend API, standardizing data structures. '''

from pydantic import BaseModel, Field

# Example model for now
class Example(BaseModel):
    id: int = Field(..., description="Unique identifier for the example")
    name: str = Field(..., description="Name of the example")
    description: str = Field(None, description="Optional description of the example")