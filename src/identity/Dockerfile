FROM alpine:latest AS stage1
WORKDIR /app
RUN echo "hello world" > output.txt

FROM scratch AS export
COPY --from=stage1 /app/output.txt .