import { useApp } from '@/context/AppContext';
import { Icons } from '../Icons';

export default function ThemeToggle() {
    const { toggleTheme } = useApp();
    return (
        <button className="iconbtn themebtn" onClick={toggleTheme} aria-label="Toggle theme">
            {Icons.moon}
        </button>
    );
}