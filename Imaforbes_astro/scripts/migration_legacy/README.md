# Migration Legacy Scripts

This folder contains the automated scripts (`.cjs` and `.py`) that were used during the initial migration from the legacy React SPA to the Astro v5/v7 architecture.

## Files
- `fix_components.cjs`: Automated replacement of React Router `<Link>` components with standard `<a>` tags and provider wrappers.
- `fix_css.py`: Script used to migrate and normalize CSS class definitions.
- `generate_pages.cjs`: Utility to generate initial `.astro` wrapper pages for React SPA views.
- `refactor_navigate.cjs`: Replaced `useNavigate()` calls with standard browser location navigation.
- `refactor_router.cjs`: Updated router syntax for Astro compatibility.
- `wrap_providers.cjs`: Utility that wrapped React components with `withProviders`.

> [!NOTE]
> These scripts are preserved for historical reference and documentation purposes only. They are not executed during normal `npm run dev` or `npm run build` workflows.
