# 景庄 | wwsun's Blog

[![Hexo Version](https://img.shields.io/badge/Hexo-7.3.0-blue.svg)](https://hexo.io/)
[![Node.js Version](https://img.shields.io/badge/Node.js-20.19.0-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

wwsun's personal blog, powered by Hexo 7.3.0.

🌐 **Visit**: [https://wwsun.github.io](https://wwsun.github.io)

## 📚 About

This is a personal tech blog built with Hexo static site generator, primarily sharing content about frontend development, JavaScript, Node.js, and related technologies.

## 🚀 Getting Started

### Prerequisites

- Node.js 16.0+ (recommended 20.19.0+)
- Git

### Install Dependencies

```bash
npm install
```

### Local Development

```bash
# Start development server
npm run dev

# Or use
npm run server
```

Visit [http://localhost:4000](http://localhost:4000) to view the website.

### Build and Deploy

```bash
# Clean cache files
npm run clean

# Generate static files
npm run build

# Deploy to GitHub Pages
npm run deploy

# Full deployment process (clean + generate + deploy)
npm run deploy:full
```

## 📝 Writing

### Create New Content

```bash
# Create new post
npx hexo new "Post Title"

# Create new page
npx hexo new page "Page Name"

# Create draft
npx hexo new draft "Draft Title"
```

### Content Directory Structure

```
source/
├── _posts/          # Blog posts
├── _drafts/         # Draft files
└── about/           # About page
```

## 🎨 Theme

Currently using the **Cactus** theme, optimized for Chinese content, which supports:

- Responsive design
- Chinese font optimization
- Code highlighting with Chinese comments support
- Social media links
- RSS feed
- Search functionality
- Optimized typography for Chinese text

## 🛠️ Tech Stack

- **Static Generator**: Hexo 7.3.0
- **Template Engine**: EJS
- **CSS Preprocessor**: Stylus
- **Code Highlighting**: highlight.js
- **Deployment Platform**: GitHub Pages

## 📄 License

This project is open source under the [MIT License](LICENSE).

## 📞 Contact

- Email: ww.sun@outlook.com
- GitHub: [@wwsun](https://github.com/wwsun)
- Blog: [https://wwsun.github.io](https://wwsun.github.io)

---

⭐ If this project helps you, feel free to give it a Star!
