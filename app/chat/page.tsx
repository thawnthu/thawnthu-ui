import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useRouter } from "next/navigation";

const router = useRouter();
const [menuOpen, setMenuOpen] = useState(false);

const handleLogout = async () => {
  await signOut(auth);
  router.push('/login');
}

// HEADER AH HIAN
<div style={{display: 'flex', justifyContent: 'space-between', padding: '16px'}}>
  <h2>Private Chat</h2>
  <div style={{position: 'relative'}}>
    <button onClick={()=>setMenuOpen(!menuOpen)}>⋮</button>
    {menuOpen && (
      <div style={{position: 'absolute', right: 0, background: 'white', border: '1px solid #ccc', borderRadius: '8px'}}>
        <button onClick={handleLogout} style={{padding: '10px 16px', border: 'none', background: 'none'}}>Logout</button>
      </div>
    )}
  </div>
</div>
