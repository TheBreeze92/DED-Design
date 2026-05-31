# RELEASES.md

## Release History

### v0.1.0 - Initial Release
**Date**: 2026-05-31  
**Status**: ✅ Released  
**Branch**: main  
**Commit**: Latest on main after initial development

#### What's Included
- URL extraction to Markdown
- Screenshot preview
- Scrollable panels with sticky download button
- Mobile responsive layout
- Brutalist UI design

#### Deployment
- **Repository**: https://github.com/TheBreeze92/DED-Design
- **Local URL**: http://localhost:3000 (development)
- **Platform**: Vercel (recommended for production)

#### Getting Started
```bash
cd design-md
npm install
npm run dev
```

---

## Future Releases

### v0.2.0 - Enhanced UX
**Planned Features**:
- Copy to clipboard button
- Loading skeleton states
- Improved error messages
- Better screenshot quality

**Target Date**: TBD

### v1.0.0 - Production Ready
**Planned Features**:
- Persistent storage (save extractions)
- Multiple export formats (PDF, HTML)
- Authentication for private docs
- Custom extraction selectors

**Target Date**: TBD

---

## Release Process

1. **Development**: Feature work on feature branches
2. **Code Review**: Review changes before merge
3. **TypeCheck**: Ensure TypeScript compiles cleanly
4. **Testing**: Manual testing on local environment
5. **Merge**: Squash and merge to main
6. **Tag**: Create version tag (e.g., v0.2.0)
7. **Deploy**: Push to Vercel or chosen platform

## Versioning Strategy

- **Major.Minor.Patch** format
- Major: Breaking changes
- Minor: New features (backwards compatible)
- Patch: Bug fixes

## Changelog Location

Changes are documented in:
- `CHANGELOG.md` - Detailed version history
- `agent/` directory - Agent and developer documentation