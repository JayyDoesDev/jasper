# ONLY RUN THIS WHEN DEALING WITH EXFAT FORMATS ON MACOS

# Default target when running just `make`
.DEFAULT_GOAL := gobuild

# Clean Apple macOS metadata files everywhere
clean-macos-metadata:
	@echo "Removing all .DS_Store and Apple metadata files recursively..."
	@find . -name '.DS_Store' -type f -delete 2>/dev/null || true
	@find . -name '._*' -type f -delete 2>/dev/null || true
	@echo "Done cleaning macOS metadata."

# Clean all apps that have their own clean target
cleanapps:
	@echo "Cleaning all apps..."
	@for dir in ./apps/*; do \
		if [ -f $$dir/Makefile ]; then \
			echo "Cleaning in $$dir..."; \
			$(MAKE) -C $$dir clean || echo "No clean target in $$dir"; \
		fi; \
	done

# One command to clean everything
cleanall: clean-macos-metadata cleanapps
	@echo "Full cleanup complete!"

# Build and run targets unchanged
gobuild:
	@echo "Building Go project..."
	$(MAKE) -C ./apps/webserverGo build

gorun: gobuild
	@echo "Running Go project..."
	$(MAKE) -C ./apps/webserverGo run
