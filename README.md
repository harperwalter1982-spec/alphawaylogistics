# Alphaway Logistics - Freight & Dispatch Platform

A modern, responsive website for Alphaway Logistics LLC, providing dispatch support, load visibility, and carrier partnerships for freight operations nationwide.

## Features

- **Homepage**: Marketing site showcasing services, pricing plans, and company info
- **Load Board**: Interactive load board for browsing available freight opportunities
- **Responsive Design**: Mobile-friendly interface with dark theme
- **Service Plans**: Alpha and Omega tiers for different operation sizes
- **Contact & Signup**: Forms for inquiries and plan selection

## Project Structure

```
alphaway-deploy/
├── index.html                 # Homepage
├── loadboard.html            # Load board page
├── css/
│   ├── style.css            # Main stylesheet
│   └── loadboard.css        # Load board specific styles
├── js/
│   ├── script.js            # Shared utilities and homepage script
│   └── loadboard.js         # Load board functionality
├── .gitignore               # Git ignore rules
└── README.md               # This file
```

## Quick Start

### Local Development

1. Clone this repository
2. Open `index.html` in your browser or run a local server:
   ```bash
   python -m http.server 8000
   # or with Node.js
   npx http-server
   ```
3. Navigate to `http://localhost:8000`

### GitHub Pages Deployment

#### Option 1: Using GitHub CLI (Recommended)

1. **Create a new GitHub repository**:
   ```bash
   gh repo create alphawaylogistics --public --source=. --remote=origin --push
   ```

2. **Enable GitHub Pages** in repository settings:
   - Go to Settings → Pages
   - Set Source to "Deploy from a branch"
   - Select branch: `main`
   - Select folder: `/ (root)`
   - Click "Save"

3. **Your site will be live** at: `https://yourusername.github.io/alphawaylogistics`

#### Option 2: Manual GitHub Setup

1. **Create a repository** on GitHub (named `alphawaylogistics`)

2. **Clone and push your code**:
   ```bash
   cd alphaway-deploy
   git init
   git add .
   git commit -m "Initial commit: Alphaway Logistics website"
   git branch -M main
   git remote add origin https://github.com/yourusername/alphawaylogistics.git
   git push -u origin main
   ```

3. **Enable GitHub Pages**:
   - Go to your repository → Settings → Pages
   - Select branch `main`, folder `/ (root)`
   - Click Save
   - Your site will be available at `https://yourusername.github.io/alphawaylogistics`

#### Option 3: User/Organization Site

If you want to deploy to a **user or organization site** (e.g., `yourusername.github.io`):

1. Create a repository named `yourusername.github.io`
2. Push this code to that repository
3. GitHub Pages will automatically be enabled
4. Site will be live at `https://yourusername.github.io`

## Customization

### Update Company Information

Edit these files to customize content:

- **Homepage text**: `index.html` - Update headings, descriptions, pricing
- **Contact info**: `index.html` footer - Update phone, email, address
- **Load board data**: `js/script.js` - Modify the `loads` array
- **Styling**: `css/style.css` - Update colors, fonts, spacing

### Color Scheme

Main colors are defined in `css/style.css`:

```css
:root {
  --accent: #c9a85d;           /* Primary accent (gold)        */
  --text: #f5f3ef;             /* Main text color              */
  --bg: #0d0d0c;               /* Dark background              */
  --success: #8cc77b;          /* Success color (green)        */
  /* ...more colors... */
}
```

### Add More Pages

Create new `.html` files and reference them in the navigation or footer:

```html
<a href="./newpage.html">New Page</a>
```

Ensure all asset paths are relative (`./css/style.css`, `./js/script.js`).

## Features by Page

### Homepage (`index.html`)
- Hero section with key metrics
- Service features overview
- Pricing comparison
- About/who we serve section
- Signup form

### Load Board (`loadboard.html`)
- Filterable load listings
- Search by origin/destination
- Equipment and rate filtering
- Real-time load status (Hot/New)
- Responsive card layout

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- No external dependencies (vanilla JavaScript)
- Fast load times with optimized CSS
- Responsive images and lazy loading ready
- Mobile-first responsive design

## Accessibility

- Semantic HTML structure
- ARIA labels on key components
- Keyboard navigation support
- Good contrast ratios for readability

## Future Enhancements

- [ ] Backend API integration
- [ ] User authentication
- [ ] Broker intake form
- [ ] Carrier agreement details
- [ ] Real-time notifications
- [ ] Mobile app
- [ ] CMS integration

## Support

For questions or issues:
- Phone: 303-502-5008
- Email: info@alphawaylogistics.com
- Location: Denver, Colorado

## License

© 2024 Alphaway Logistics LLC. All rights reserved.

---

**Ready to launch?** Follow the GitHub Pages Deployment steps above to get your site live in minutes!
