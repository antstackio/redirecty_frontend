import { Link } from 'react-router-dom';
import { Button } from "../components/ui/button";
import PlusCircle from 'lucide-react/dist/esm/icons/plus-circle';
import { UrlList } from '../components/UrlList';

const Dashboard = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8 animate-slide-down">
            <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
            <Button asChild>
              <Link to="/create-url">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New URL
              </Link>
            </Button>
          </div>
          <div className="animate-fade-up" style={{ animationDelay: '80ms' }}>
            <UrlList />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

 