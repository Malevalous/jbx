from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import openai
import os
import redis
import json
import logging
from datetime import datetime
import uuid

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="JBX Cover Letter Service", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI client
openai.api_key = os.getenv("OPENAI_API_KEY")

# Initialize Redis
redis_client = redis.Redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379"))

class CoverLetterRequest(BaseModel):
    job_description: str
    job_title: str
    company_name: str
    applicant_name: str
    applicant_email: str
    resume_text: str
    experience_level: Optional[str] = "mid"
    custom_message: Optional[str] = ""

class CoverLetterResponse(BaseModel):
    id: str
    cover_letter: str
    created_at: str
    metadata: dict

@app.post("/generate", response_model=CoverLetterResponse)
async def generate_cover_letter(request: CoverLetterRequest, background_tasks: BackgroundTasks):
    """Generate a tailored cover letter using OpenAI GPT"""
    try:
        # Generate unique ID for this request
        letter_id = str(uuid.uuid4())
        
        # Create the prompt for OpenAI
        prompt = create_cover_letter_prompt(request)
        
        # Call OpenAI API
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": "You are a professional career advisor and expert cover letter writer. Create compelling, personalized cover letters that highlight relevant skills and experience."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens=800,
            temperature=0.7
        )
        
        cover_letter = response.choices[0].message.content.strip()
        
        # Store in Redis for caching
        result = CoverLetterResponse(
            id=letter_id,
            cover_letter=cover_letter,
            created_at=datetime.utcnow().isoformat(),
            metadata={
                "job_title": request.job_title,
                "company_name": request.company_name,
                "applicant_name": request.applicant_name
            }
        )
        
        # Cache result
        background_tasks.add_task(cache_cover_letter, letter_id, result.dict())
        
        logger.info(f"Generated cover letter {letter_id} for {request.company_name}")
        return result
        
    except Exception as e:
        logger.error(f"Error generating cover letter: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate cover letter: {str(e)}")

def create_cover_letter_prompt(request: CoverLetterRequest) -> str:
    """Create a detailed prompt for cover letter generation"""
    
    prompt = f"""
Generate a professional cover letter for the following job application:

JOB DETAILS:
- Position: {request.job_title}
- Company: {request.company_name}
- Job Description: {request.job_description[:2000]}  # Limit to prevent token overflow

APPLICANT DETAILS:
- Name: {request.applicant_name}
- Email: {request.applicant_email}
- Experience Level: {request.experience_level}

RESUME/BACKGROUND:
{request.resume_text[:1500]}  # Limit to prevent token overflow

{f"CUSTOM MESSAGE: {request.custom_message}" if request.custom_message else ""}

REQUIREMENTS:
1. Create a personalized cover letter that directly addresses the job requirements
2. Highlight relevant skills and experiences from the resume
3. Show genuine interest in the company and role
4. Maintain a professional yet engaging tone
5. Keep it concise (3-4 paragraphs)
6. Include a strong opening and compelling closing
7. Avoid generic phrases and make it specific to this opportunity

Format the cover letter professionally with proper structure and flow.
"""
    
    return prompt

async def cache_cover_letter(letter_id: str, data: dict):
    """Cache cover letter in Redis"""
    try:
        redis_client.setex(
            f"cover_letter:{letter_id}",
            3600 * 24,  # 24 hours
            json.dumps(data)
        )
    except Exception as e:
        logger.error(f"Failed to cache cover letter {letter_id}: {str(e)}")

@app.get("/cover-letter/{letter_id}", response_model=CoverLetterResponse)
async def get_cover_letter(letter_id: str):
    """Retrieve a cached cover letter"""
    try:
        cached_data = redis_client.get(f"cover_letter:{letter_id}")
        if not cached_data:
            raise HTTPException(status_code=404, detail="Cover letter not found")
        
        data = json.loads(cached_data)
        return CoverLetterResponse(**data)
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Invalid cached data")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Test Redis connection
        redis_client.ping()
        
        # Test OpenAI API (optional, might be rate limited)
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "services": {
                "redis": "connected",
                "openai": "configured"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Service unhealthy: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
