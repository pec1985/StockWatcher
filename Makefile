.PHONY: database

database:
	docker-compose up --build -d postgres
