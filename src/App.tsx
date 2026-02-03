import SearchLayout from './components/SearchLayout'
import * as stylex from '@stylexjs/stylex'

const styles = stylex.create({
  app: {
    height: '100vh',
    width: '100vw',
    backgroundColor: '#f8f9fa',
    padding: '1.5rem',
    overflow: 'hidden',
    boxSizing: 'border-box',
  }
})

function App() {
  return (
    <div {...stylex.props(styles.app)}>
      <SearchLayout />
    </div>
  )
}

export default App
