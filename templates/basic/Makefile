PROJECT_NAME    ?= __YV_APP_NAME__
DIR_BUILD	?= build
DIR_DIST	?= dist
GENERATOR	?= Ninja

UNAME_S	:= $(shell uname -s)
ifeq ($(UNAME_S),Darwin)
    APP_BIN_DEV	:= $(DIR_BUILD)/$(PROJECT_NAME).app/Contents/MacOS/$(PROJECT_NAME)
	APP_BIN_DIST := $(DIR_DIST)/$(PROJECT_NAME).app/Contents/MacOS/$(PROJECT_NAME)
else
	APP_BIN_DEV := $(DIR_BUILD)/$(PROJECT_NAME)
	APP_BIN_DIST := $(DIR_DIST)/$(PROJECT_NAME)
endif

.PHONY: all dev build clean

all: dev

dev:
	@cmake -S . -B $(DIR_BUILD) -G $(GENERATOR) -DCMAKE_BUILD_TYPE=Debug -DCMAKE_POLICY_VERSION_MINIMUM=3.10
	@cmake --build $(DIR_BUILD)
	@./$(APP_BIN_DEV)

build:
	@cmake -S . -B $(DIR_BUILD) -G $(GENERATOR) -DCMAKE_BUILD_TYPE=Release -DCMAKE_POLICY_VERSION_MINIMUM=3.10
	@cmake --build $(DIR_BUILD)
	@cmake --install $(DIR_BUILD) --prefix $(DIR_DIST)
	@./$(APP_BIN_DIST)

clean:
	@rm -rf .cache $(DIR_BUILD) $(DIR_DIST)