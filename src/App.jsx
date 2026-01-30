import SearchLayout from './SearchLayout'
import * as stylex from '@stylexjs/stylex'

const styles = stylex.create({
  app: {
    minHeight: '100vh',
    width: '100vw',
    maxWidth: '100vw',
    backgroundColor: '#f8f9fa',
    padding: '1.5rem',
    overflowX: 'hidden',
    boxSizing: 'border-box',
  },
  header: {
    textAlign: 'center',
    marginBottom: '1.25rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: 'bold',
    color: '#2c3e50',
  }
})

function App() {
  return (
    <div {...stylex.props(styles.app)}>
      <div {...stylex.props(styles.header)}>
        <h1 {...stylex.props(styles.title)}>San Francisco Mobile Food Facility Permit Search</h1>
      </div>
      <SearchLayout />
    </div>
  )
}

export default App
