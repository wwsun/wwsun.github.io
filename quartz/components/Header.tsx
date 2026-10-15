import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const Header: QuartzComponent = ({ children }: QuartzComponentProps) => {
  return children.length > 0 ? (
    <header class="site-header">
      <div class="site-header-inner">{children}</div>
    </header>
  ) : null
}

Header.css = `
.site-header {
  width: 100%;
  box-sizing: border-box;
}

.site-header-inner {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  max-width: 1120px;
  margin: 0 auto;
  height: 5rem;
  padding: 0 2rem;
  gap: 1.5rem;
  box-sizing: border-box;
}
`

export default (() => Header) satisfies QuartzComponentConstructor
