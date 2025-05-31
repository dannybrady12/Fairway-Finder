'use client';

import { Round, Score } from '@/types/database.types';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import { Clock, Flag, User } from 'lucide-react';

interface LiveRoundCardProps {
  round: Round;
}

export default function LiveRoundCard({ round }: LiveRoundCardProps) {
  const [scores, setScores] = useState<Score[]>(round.scores || []);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createBrowserClient();
  
  // Calculate time elapsed since round started
  const timeElapsed = () => {
    const startTime = new Date(round.created_at).getTime();
    const now = new Date().getTime();
    const elapsed = now - startTime;
    
    const hours = Math.floor(elapsed / (1000 * 60 * 60));
    const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };
  
  // Subscribe to real-time updates for this round's scores
  useEffect(() => {
    setIsLoading(true);
    
    // Fetch latest scores
    const fetchScores = async () => {
      const { data } = await supabase
        .from('scores')
        .select('*, hole:course_holes(*)')
        .eq('round_id', round.id)
        .order('hole_id', { ascending: true });
      
      if (data) {
        setScores(data);
      }
      
      setIsLoading(false);
    };
    
    fetchScores();
    
    // Subscribe to score changes
    const subscription = supabase
      .channel(`scores-${round.id}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'scores',
          filter: `round_id=eq.${round.id}`
        }, 
        () => {
          fetchScores();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [supabase, round.id]);
  
  // Calculate current score relative to par
  const calculateScoreVsPar = () => {
    if (!scores || scores.length === 0) return 'E';
    
    const totalStrokes = scores.reduce((sum, score) => sum + score.strokes, 0);
    const totalPar = scores.reduce((sum, score) => sum + (score.hole?.par || 0), 0);
    
    const diff = totalStrokes - totalPar;
    
    if (diff === 0) return 'E';
    if (diff > 0) return `+${diff}`;
    return diff.toString();
  };
  
  // Get current hole number
  const getCurrentHole = () => {
    if (!scores || scores.length === 0) return 1;
    return scores.length;
  };
  
  return (
    <Link href={`/rounds/${round.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 mr-3">
                {round.user?.profile_image_url ? (
                  <Image 
                    src={round.user.profile_image_url} 
                    alt={round.user.username} 
                    width={40} 
                    height={40}
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-green-100 text-green-800 font-bold">
                    <User className="h-5 w-5" />
                  </div>
                )}
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {round.user?.full_name || round.user?.username}
                </div>
                <div className="text-sm text-gray-500">
                  {round.course?.name}
                </div>
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              <span>{timeElapsed()}</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Flag className="h-5 w-5 mr-1 text-green-600" />
              <span className="font-medium">Hole {getCurrentHole()}</span>
              <span className="mx-2 text-gray-400">•</span>
              <span>{calculateScoreVsPar()}</span>
            </div>
            <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
              LIVE
            </div>
          </div>
          
          {/* Score summary */}
          <div className="mt-3 overflow-x-auto">
            <div className="flex space-x-1">
              {scores.map((score) => (
                <div 
                  key={score.id} 
                  className={`w-7 h-7 flex items-center justify-center text-xs font-medium rounded-full
                    ${score.strokes < (score.hole?.par || 4) ? 'bg-red-100 text-red-800' : 
                      score.strokes > (score.hole?.par || 4) ? 'bg-blue-100 text-blue-800' : 
                      'bg-gray-100 text-gray-800'}`}
                >
                  {score.strokes}
                </div>
              ))}
              {isLoading && (
                <div className="w-7 h-7 bg-gray-100 animate-pulse rounded-full"></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
