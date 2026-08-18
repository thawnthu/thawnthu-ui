export default function Home() {
  const stories = [
    { title: "Kum 10 Hnu ah", author: "Lalruata", views: "2.1k" },
    { title: "Ka Nunhlui", author: "Mami", views: "1.8k" },
    { title: "Hmangaihna Vanga Tap", author: "Zuala", views: "3.4k" },
  ]

  return (
    <main style={{padding: '20px', paddingBottom: '80px'}}>
      <h1 style={{fontSize: '24px', fontWeight: '800', marginBottom: '20px'}}>
        Thawnthu thar
      </h1>
      
      {stories.map((s, i) => (
        <div key={i} style={{
          background: '#1a1a1c',
          padding: '16px',
          borderRadius: '12px',
          marginBottom: '12px',
          border: '1px solid #2a2a2c'
        }}>
          <h3 style={{margin: '0 0 8px 0', fontSize: '18px'}}>{s.title}</h3>
          <p style={{margin: '0', fontSize: '14px', color: '#aaa'}}>
            {s.author} • {s.views} views
          </p>
        </div>
      ))}

      {/* BottomNav */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#1a1a1c',
        borderTop: '1px solid #2a2a2c',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '10px 0'
      }}>
        <button style={{background: 'none', border: 'none', color: '#fff'}}>🏠 Home</button>
        <button style={{background: 'none', border: 'none', color: '#aaa'}}>🔍 Search</button>
        <button style={{background: 'none', border: 'none', color: '#aaa'}}>📚 Library</button>
        <button style={{background: 'none', border: 'none', color: '#aaa'}}>👤 Profile</button>
      </div>
    </main>
  )
}
