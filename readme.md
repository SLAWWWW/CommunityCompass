social connectedness platform leveraging semantic similarity algorithm to connect people with similar interests and activities.

## Prerequisites
-   Python 3.12+

## Installation

1.  Create a virtual environment:
    ```bash
    python -m venv .venv
    ```
2.  Activate the virtual environment:
    -   Windows: `.venv\Scripts\activate`
    -   Mac/Linux: `source .venv/bin/activate`
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

## Running the Server

Run the server with auto-reload:

```bash
uvicorn app.main:app --reload
```


run frontend:
```bash
npm run dev
```

## API Documentation

Once running, access the interactive API docs at:
-   Swagger UI: http://127.0.0.1:8000/docs
-   ReDoc: http://127.0.0.1:8000/redoc