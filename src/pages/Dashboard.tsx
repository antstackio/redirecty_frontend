import { Link } from 'react-router-dom';
import { Button } from "../components/ui/button";
import { PlusCircle } from 'lucide-react';
import { UrlList } from '../components/UrlList';

const Dashboard = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4 mx-auto">
          <div className="flex-row items-center gap-2">
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Manage your shortened URLs and view analytics.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link to="/create-url">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New URL
              </Link>
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        <div className="container py-6 mx-auto">
          <UrlList />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

 