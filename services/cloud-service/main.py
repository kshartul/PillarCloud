from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import (
    compute, network, storage, images,
    swift, heat, octavia, barbican, designate,
    manila, magnum, trove, sahara, ironic,
    zaqar, telemetry, mistral, watcher,
)

app = FastAPI(title="Cloud Service", version="1.0.0")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# Core services
app.include_router(compute.router)
app.include_router(network.router)
app.include_router(storage.router)
app.include_router(images.router)

# Extended services
app.include_router(swift.router)
app.include_router(heat.router)
app.include_router(octavia.router)
app.include_router(barbican.router)
app.include_router(designate.router)
app.include_router(manila.router)
app.include_router(magnum.router)
app.include_router(trove.router)
app.include_router(sahara.router)
app.include_router(ironic.router)
app.include_router(zaqar.router)
app.include_router(telemetry.router)
app.include_router(mistral.router)
app.include_router(watcher.router)

@app.get("/health")
async def health():
    return {"status": "ok", "service": "cloud-service"}
