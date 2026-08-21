'use client';
import { useParams } from 'next/navigation';

export default function ChatPage() {
  const params = useParams();
  const userId = params.id;

  return (
    <div style={{background: 'white', padding: '20px', borderRadius: '12px'}}>
      <h2>Chat with User ID: {userId}</h2>
      <p>Tah hian message lam kan la siam leh ang</p>
    </div>
  )
}
