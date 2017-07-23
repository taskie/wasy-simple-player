.PHONY: all build reload-and-build reload clean clobber distribute js

include build/vars.mk

all: reload-and-build

build: html css js

reload-and-build: reload
	$(MAKE) build

reload:
	$(MAKE) -B build/vars.mk

clean:
	-rm -f vars.mk
	-rm -rf build/

clobber: clean
	-rm -rf dist/

distribute: reload-and-build
	-rm -rf dist/
	cp -pr build dist
	-rm -f dist/vars.mk

js: $(DST_JS)

build/vars.mk: tools/vars.js
	@mkdir -p build
	node $< > $@

BIN := $(shell npm bin)

$(DST_JS): $(SRC_TS) $(SRC_JS) $(CONFIG)
	@mkdir -p $(dir $@)
	$(BIN)/webpack --progress --colors --config webpack.config.js

html: $(DST_HTML)

css: $(DST_CSS)

js: $(DST_JS)

$(DST)/%.html: $(SRC)/%.ejs
	@mkdir -p $(dir $@)
	node tools/conv_ejs.js $< $@

$(DST)/%.html: $(SRC)/%.html
	@mkdir -p $(dir $@)
	cp $< $@

$(DST)/%.css: $(SRC)/%.styl
	@mkdir -p $(dir $@)
	$(BIN)/stylus $< -o $@

$(DST)/%.css: $(SRC)/%.css
	@mkdir -p $(dir $@)
	cp $< $@
