from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field


class EducationProfile(BaseModel):
    degree: Optional[str] = None
    institution: Optional[str] = None
    branch: Optional[str] = None
    graduation_year: Optional[int] = None


class CodingProfiles(BaseModel):
    github: Optional[str] = None
    leetcode: Optional[str] = None
    codeforces: Optional[str] = None
    hackerrank: Optional[str] = None


class UserCreate(BaseModel):
    email: EmailStr
    name: str
    phone_number: str = Field(min_length=8)
    dob: str
    password: str = Field(min_length=6)
    role: Literal["student", "career_switcher", "mentor"] = "student"
    target_role: Optional[str] = None
    experience_years: float = 0
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    education_profile: Optional[EducationProfile] = None
    coding_profiles: Optional[CodingProfiles] = None
    bio: Optional[str] = None


class UserOut(BaseModel):
    id: str
    email: EmailStr
    name: str
    phone_number: str
    dob: str
    role: Literal["student", "career_switcher", "mentor"]
    target_role: Optional[str] = None
    experience_years: float = 0
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    education_profile: Optional[EducationProfile] = None
    coding_profiles: Optional[CodingProfiles] = None
    bio: Optional[str] = None
    created_at: datetime


class SignInRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    token: str
    user: UserOut


class ResumeCreate(BaseModel):
    user_id: str
    title: str = "Resume"
    raw_text: str = Field(min_length=30)
    source: Literal["upload", "manual", "seed"] = "manual"


class SkillEvidence(BaseModel):
    name: str
    confidence: float = 0.7


class ResumeOut(BaseModel):
    id: str
    user_id: str
    title: str
    source: str
    raw_text: str
    parsed_skills: list[SkillEvidence]
    created_at: datetime


class GapAnalysisRequest(BaseModel):
    user_id: str
    resume_id: str
    target_role: str


class GapAnalysisOut(BaseModel):
    analysis_id: str
    target_role: str
    matched_skills: list[str]
    missing_skills: list[str]
    transferable_skills: list[str]
    coverage_score: float
    ai_used: bool = False
    fallback_used: bool = True


class ResumeMatchOut(BaseModel):
    benchmark_resume_id: str
    benchmark_role: str
    benchmark_level: str
    match_score: float
    matched_skills: list[str]
    missing_skills: list[str]


class InsightRequest(BaseModel):
    user_id: str
    analysis_id: Optional[str] = None


class InsightOut(BaseModel):
    summary: str
    strengths: list[str]
    focus_areas: list[str]
    next_30_days: list[str]
    ai_used: bool = False
    fallback_used: bool = True


class RoadmapItem(BaseModel):
    title: str
    provider: str
    duration: str
    cost_type: Literal["free", "paid"] = "free"
    milestone: Literal["quick_wins", "core_skills", "advanced_projects"]


class RoadmapRequest(BaseModel):
    analysis_id: str
    user_id: str


class RoadmapOut(BaseModel):
    roadmap_id: str
    user_id: str
    analysis_id: str
    items: list[RoadmapItem]
    ai_used: bool = False
    fallback_used: bool = True


class InterviewRequest(BaseModel):
    analysis_id: str
    user_id: str


class InterviewQuestion(BaseModel):
    skill: str
    level: Literal["beginner", "intermediate", "advanced"]
    question: str
    expected_concepts: list[str]


class InterviewSetOut(BaseModel):
    set_id: str
    analysis_id: str
    user_id: str
    questions: list[InterviewQuestion]
    source: Literal["ai", "rules"] = "rules"
