# Use an official Python image as the base image
FROM python:3.9-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements.txt file to install dependencies
COPY requirements.txt ./

RUN apt-get update && apt-get install -y \
    build-essential \
    libffi-dev \
    python3-dev \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies from requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application files
COPY . .

# Set the environment to be used by Flask (production mode)


# Expose the port Flask will run on
EXPOSE 5001

# CMD ["flask", "run", "--host=0.0.0.0", "--port=5001", "--reload"]  # enable while working on developement mode and need auto reload after code changes

# Use Gunicorn as the production-ready server with 4 workers
CMD ["gunicorn", "-k", "geventwebsocket.gunicorn.workers.GeventWebSocketWorker", "-w", "1", "-b", "0.0.0.0:5001", "app:app"]


