from enum import Enum
from typing import Optional
from pydantic import BaseModel
import httpx
from fastapi import HTTPException
from dotenv import load_dotenv
import os

load_dotenv()

class CompilerService(str, Enum):
    JDOODLE = "jdoodle"
    WANDBOX = "wandbox"
    COMPILER_EXPLORER = "compiler_explorer"

class CodeFixRequest(BaseModel):
    code: str
    error_message: str
    language: str
    compiler_service: CompilerService = CompilerService.JDOODLE

class JDoodleExecutor:
    def __init__(self):
        self.client_id = os.getenv("JDOODLE_CLIENT_ID")
        self.client_secret = os.getenv("JDOODLE_CLIENT_SECRET")
        self.api_url = "https://api.jdoodle.com/v1/execute"

    async def execute(self, code: str, language: str) -> dict:
        payload = {
            "clientId": self.client_id,
            "clientSecret": self.client_secret,
            "script": code,
            "language": language,
            "versionIndex": "0"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(self.api_url, json=payload)
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail="JDoodle API execution failed")
            return response.json()

class WandboxExecutor:
    def __init__(self):
        self.api_url = os.getenv("WANDBOX_API_URL")

    async def execute(self, code: str, language: str) -> dict:
        payload = {
            "code": code,
            "compiler": language
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{self.api_url}/compile.json", json=payload)
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail="Wandbox API execution failed")
            return response.json()

class CompilerExplorerExecutor:
    def __init__(self):
        self.api_url = os.getenv("COMPILER_EXPLORER_URL")

    async def execute(self, code: str, language: str) -> dict:
        payload = {
            "source": code,
            "options": {
                "userArguments": "",
                "compilerOptions": { "producePp": False },
                "filters": { "execute": True }
            },
            "lang": language
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{self.api_url}/compiler/{language}/compile", json=payload)
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail="Compiler Explorer API execution failed")
            return response.json()

class CodeFixService:
    def __init__(self):
        self.jdoodle = JDoodleExecutor()
        self.wandbox = WandboxExecutor()
        self.compiler_explorer = CompilerExplorerExecutor()

    async def fix_code(self, request: CodeFixRequest) -> dict:
        try:
            if request.compiler_service == CompilerService.JDOODLE:
                result = await self.jdoodle.execute(request.code, request.language)
            elif request.compiler_service == CompilerService.WANDBOX:
                result = await self.wandbox.execute(request.code, request.language)
            else:
                result = await self.compiler_explorer.execute(request.code, request.language)

            return {
                "original_code": request.code,
                "error_message": request.error_message,
                "execution_result": result,
                "service_used": request.compiler_service
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))