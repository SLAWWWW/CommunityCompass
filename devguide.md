cara pake:
api functionality is in /api/v1/
to add an endpoint, go to endpoints and edit existing files or add new files based on functionality, misal klo mau add new functionality relating to groups edit di groups.py, and make sure to update any relevant blocks in api.py.

to run, use ```uvicorn app.main:app --reload```