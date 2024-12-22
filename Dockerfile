FROM debian:latest

RUN apt-get update -yqq && \
    apt-get install -yqq build-essential cmake ca-certificates curl pkg-config git python3 autogen automake autoconf libtool

COPY build /build
WORKDIR /build

CMD ["/bin/bash", "/build/build.sh"]
