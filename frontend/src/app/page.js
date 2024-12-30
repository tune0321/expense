import ExpenseTracker from '../components/ExpenseTracker';
import './globals.css'; #お試し
export default function Home() {
  return (
    <main className="container mx-auto py-8 px-4">
      <ExpenseTracker />
    </main>
  );
}
