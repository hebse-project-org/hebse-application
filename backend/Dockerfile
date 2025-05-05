FROM python:3.11

WORKDIR /code

COPY ./requirements.txt /code/requirements.txt

RUN pip install --no-cache-dir -r requirements.txt

COPY ./database /code/database

COPY ./app /code/app

CMD ["fastapi", "run", "app/main.py", "--port", "8000"]