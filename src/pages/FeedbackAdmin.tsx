import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Eye, Search, Star, BarChart3, Users, Award, Terminal, Lock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// ═══════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════
interface FeedbackEntry {
  timestamp: string;
  name: string;
  rollNo: string;
  year: string;
  branch: string;
  section: string;
  overallRating: number;
  engagementRating: number;
  workshopEnhancement: string;
  understandingRating: number;
  suggestions: string;
}

// ═══════════════════════════════════════════════════════════════════════
// MATRIX RAIN EFFECT
// ═══════════════════════════════════════════════════════════════════════
const MatrixRain = () => {
  const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
  const columns = Math.floor(window.innerWidth / 20);
  
  return (
    <div className="fixed inset-0 pointer-events-none opacity-5 overflow-hidden">
      {Array.from({ length: columns }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-green-500 text-sm font-mono"
          style={{ left: i * 20 }}
          animate={{
            y: ['-100%', '100vh'],
          }}
          transition={{
            duration: Math.random() * 15 + 10,
            repeat: Infinity,
            ease: 'linear',
            delay: Math.random() * 5,
          }}
        >
          {Array.from({ length: 30 }).map((_, j) => (
            <div key={j} style={{ opacity: 1 - j * 0.03 }}>
              {chars[Math.floor(Math.random() * chars.length)]}
            </div>
          ))}
        </motion.div>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════
export default function FeedbackAdmin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackEntry | null>(null);
  const [filterBranch, setFilterBranch] = useState('all');
  const [bootSequence, setBootSequence] = useState(true);

  const ADMIN_PASSWORD = 'admin@0868'; // Change this!

  // ── BOOT SEQUENCE ──
  useEffect(() => {
    setTimeout(() => setBootSequence(false), 2200);
  }, []);

  // ── LOGIN HANDLER ──
  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      fetchFeedback();
    } else {
      alert('ACCESS_DENIED: INVALID_CREDENTIALS');
    }
  };

  // ── FETCH FEEDBACK ──
  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://script.google.com/macros/s/AKfycbzg_eFGtB4I_4Bk5DHxJnb1IgcoSO9bLSYkGpVJOstsPVhtWCDjK4ppLAX_xT0HTTD3BA/exec');
      const data = await response.json();
      setFeedback(data.feedback || []);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  // ── EXPORT CSV ──
  const exportToCSV = () => {
    const headers = [
      'Timestamp', 'Name', 'Roll No', 'Year', 'Branch', 'Section',
      'Overall Rating', 'Engagement Rating', 'Workshop Enhancement',
      'Understanding Rating', 'Suggestions',
    ];

    const csvData = feedback.map((entry) => [
      entry.timestamp,
      entry.name,
      entry.rollNo,
      entry.year,
      entry.branch,
      entry.section,
      entry.overallRating,
      entry.engagementRating,
      `"${entry.workshopEnhancement.replace(/"/g, '""')}"`,
      entry.understandingRating,
      `"${entry.suggestions.replace(/"/g, '""')}"`,
    ]);

    const csv = [headers, ...csvData].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `frame2reality-feedback-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // ── FILTERS ──
  const filteredFeedback = feedback.filter((entry) => {
    const matchesSearch =
      entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.rollNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = filterBranch === 'all' || entry.branch === filterBranch;
    return matchesSearch && matchesBranch;
  });

  // ── STATS ──
  const avgOverallRating =
    feedback.length > 0
      ? (feedback.reduce((sum, e) => sum + e.overallRating, 0) / feedback.length).toFixed(1)
      : '0';

  const avgEngagementRating =
    feedback.length > 0
      ? (feedback.reduce((sum, e) => sum + e.engagementRating, 0) / feedback.length).toFixed(1)
      : '0';

  const avgUnderstandingRating =
    feedback.length > 0
      ? (feedback.reduce((sum, e) => sum + e.understandingRating, 0) / feedback.length).toFixed(1)
      : '0';

  // ═══════════════════════════════════════════════════════════════════════
  // BOOT SCREEN
  // ═══════════════════════════════════════════════════════════════════════
  if (bootSequence) return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-[9999] font-mono text-green-500 px-4">
      <div className="w-full max-w-md">
        <div className="mb-2 text-xs flex justify-between animate-pulse">
          <span>INIT_ADMIN_TERMINAL</span><span>OK</span>
        </div>
        <div className="mb-2 text-xs flex justify-between animate-pulse" style={{ animationDelay: '0.3s' }}>
          <span>LOADING_SECURITY_PROTOCOLS</span><span>OK</span>
        </div>
        <div className="mb-4 text-xs animate-pulse" style={{ animationDelay: '0.6s' }}>
          ESTABLISHING_SECURE_CONNECTION...
        </div>
        <div className="h-1 bg-gray-800 rounded overflow-hidden">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 2, ease: 'easeInOut' }}
            className="h-full bg-green-500 shadow-[0_0_15px_#22c55e]"
          />
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════
  // LOGIN SCREEN
  // ═══════════════════════════════════════════════════════════════════════
  if (!isAuthenticated) return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <MatrixRain />
      
      {/* Grid BG */}
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'linear-gradient(rgba(34,197,94,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.2) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-black border-2 border-green-500 p-8 max-w-md w-full relative z-10 shadow-[0_0_50px_rgba(34,197,94,0.3)]"
      >
        <div className="flex items-center justify-center mb-6">
          <Lock className="w-16 h-16 text-green-500 animate-pulse" style={{ filter: 'drop-shadow(0 0 10px rgba(34,197,94,0.8))' }} />
        </div>
        
        <h1 className="text-3xl font-black text-green-500 mb-2 text-center font-mono tracking-wider">
          ADMIN_TERMINAL
        </h1>
        <p className="text-gray-500 text-xs text-center mb-6 font-mono">&gt; SECURITY_CLEARANCE_REQUIRED</p>
        
        <Input
          type="password"
          placeholder="Enter access code..."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
          className="bg-black border-green-500/50 text-green-400 placeholder:text-gray-700 mb-4 font-mono h-11 focus:border-green-500 focus:shadow-[0_0_10px_rgba(34,197,94,0.3)]"
        />
        
        <Button
          onClick={handleLogin}
          className="w-full bg-green-500 text-black hover:bg-green-400 font-bold font-mono shadow-[0_0_20px_rgba(34,197,94,0.5)] h-11"
        >
          AUTHENTICATE &gt;
        </Button>

        <p className="text-gray-700 text-[10px] text-center mt-4 font-mono">
          UNAUTHORIZED_ACCESS_WILL_BE_LOGGED
        </p>
      </motion.div>

      {/* Scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-5"
        style={{ backgroundImage: 'linear-gradient(0deg, transparent 50%, rgba(34,197,94,1) 50%)', backgroundSize: '100% 4px' }} />
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════
  // DASHBOARD
  // ═══════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-4 md:p-8 relative overflow-hidden">
      <MatrixRain />

      {/* Grid BG */}
      <div className="fixed inset-0 opacity-5"
        style={{ backgroundImage: 'linear-gradient(rgba(34,197,94,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.2) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />

      {/* Scanlines */}
      <div className="fixed inset-0 pointer-events-none opacity-5"
        style={{ backgroundImage: 'linear-gradient(0deg, transparent 50%, rgba(34,197,94,1) 50%)', backgroundSize: '100% 4px' }} />

      <div className="container mx-auto relative z-10">
        
        {/* ═══ HEADER ═══ */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Terminal className="w-8 h-8" />
            <h1 className="text-3xl md:text-5xl font-black tracking-wider">
              FEEDBACK_DASHBOARD
            </h1>
          </div>
          <p className="text-gray-500 text-sm">&gt; FRAME2REALITY_MISSION_DEBRIEFS</p>
        </motion.div>

        {/* ═══ STATS CARDS ═══ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Responses */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-black border-2 border-green-500/50 p-6 relative overflow-hidden group hover:border-green-500 transition-colors shadow-[0_0_20px_rgba(34,197,94,0.1)]"
          >
            <div className="absolute top-0 right-0 opacity-10 group-hover:opacity-20 transition-opacity">
              <Users className="w-24 h-24 text-green-500" />
            </div>
            <p className="text-gray-500 text-xs mb-1 relative z-10">TOTAL_RESPONSES</p>
            <p className="text-4xl font-black text-green-500 relative z-10">{feedback.length}</p>
          </motion.div>

          {/* Avg Overall */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-black border-2 border-green-500/50 p-6 relative overflow-hidden group hover:border-green-500 transition-colors shadow-[0_0_20px_rgba(34,197,94,0.1)]"
          >
            <div className="absolute top-0 right-0 opacity-10 group-hover:opacity-20 transition-opacity">
              <Award className="w-24 h-24 text-green-500" />
            </div>
            <p className="text-gray-500 text-xs mb-1 relative z-10">AVG_OVERALL</p>
            <p className="text-4xl font-black text-green-500 flex items-center gap-2 relative z-10">
              {avgOverallRating}
              <Star className="w-6 h-6 fill-green-500" />
            </p>
          </motion.div>

          {/* Avg Engagement */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-black border-2 border-green-500/50 p-6 relative overflow-hidden group hover:border-green-500 transition-colors shadow-[0_0_20px_rgba(34,197,94,0.1)]"
          >
            <div className="absolute top-0 right-0 opacity-10 group-hover:opacity-20 transition-opacity">
              <BarChart3 className="w-24 h-24 text-green-500" />
            </div>
            <p className="text-gray-500 text-xs mb-1 relative z-10">AVG_ENGAGEMENT</p>
            <p className="text-4xl font-black text-green-500 flex items-center gap-2 relative z-10">
              {avgEngagementRating}
              <Star className="w-6 h-6 fill-green-500" />
            </p>
          </motion.div>

          {/* Export Button */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-black border-2 border-green-500/50 p-6 flex items-center justify-center hover:border-green-500 transition-colors shadow-[0_0_20px_rgba(34,197,94,0.1)]"
          >
            <Button
              onClick={exportToCSV}
              className="w-full h-full bg-green-500 text-black hover:bg-green-400 font-bold flex items-center justify-center gap-2 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
            >
              <Download className="w-5 h-5" />
              EXPORT_CSV
            </Button>
          </motion.div>
        </div>

        {/* ═══ FILTERS ═══ */}
        <div className="bg-black border-2 border-green-500/50 p-4 mb-6 flex flex-col md:flex-row gap-4 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
            <Input
              placeholder="Search by name or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-black border-green-500/50 text-green-400 placeholder:text-gray-700 focus:border-green-500 font-mono h-10 focus:shadow-[0_0_10px_rgba(34,197,94,0.3)]"
            />
          </div>
          <select
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
            className="bg-black border-2 border-green-500/50 text-green-400 px-4 py-2 focus:border-green-500 outline-none h-10"
          >
            <option value="all">ALL_BRANCHES</option>
            <option value="CSE">CSE</option>
            <option value="CSD">CSD</option>
            <option value="CSB">CSB</option>
            <option value="CSM">CSM</option>
            <option value="CSC">CSC</option>
            <option value="IT">IT</option>
            <option value="ECE">ECE</option>
            <option value="EEE">EEE</option>
            <option value="CIVIL">CIVIL</option>
            <option value="MECH">MECH</option>
          </select>
        </div>

        {/* ═══ TABLE ═══ */}
        <div className="bg-black border-2 border-green-500/50 overflow-hidden shadow-[0_0_30px_rgba(34,197,94,0.2)]">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-green-500/30 hover:bg-green-500/5">
                  <TableHead className="text-green-500 font-bold">NAME</TableHead>
                  <TableHead className="text-green-500 font-bold">ROLL_NO</TableHead>
                  <TableHead className="text-green-500 font-bold">BRANCH</TableHead>
                  <TableHead className="text-green-500 font-bold">OVERALL</TableHead>
                  <TableHead className="text-green-500 font-bold">ENGAGE</TableHead>
                  <TableHead className="text-green-500 font-bold">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeedback.map((entry, index) => (
                  <TableRow
                    key={index}
                    className="border-green-500/20 hover:bg-green-500/5 transition-colors"
                  >
                    <TableCell className="text-green-400">{entry.name}</TableCell>
                    <TableCell className="text-green-400">{entry.rollNo}</TableCell>
                    <TableCell className="text-green-400">
                      {entry.branch}-{entry.section}
                    </TableCell>
                    <TableCell className="text-green-400">
                      <span className="flex items-center gap-1">
                        {entry.overallRating}
                        <Star className="w-3 h-3 fill-green-500 text-green-500" />
                      </span>
                    </TableCell>
                    <TableCell className="text-green-400">
                      <span className="flex items-center gap-1">
                        {entry.engagementRating}
                        <Star className="w-3 h-3 fill-green-500 text-green-500" />
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => setSelectedFeedback(entry)}
                        className="bg-green-500/20 border border-green-500 text-green-400 hover:bg-green-500 hover:text-black h-8 text-xs"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        VIEW
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredFeedback.length === 0 && (
            <div className="text-center py-12 text-gray-600">
              <Terminal className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-sm">&gt; NO_DATA_FOUND</p>
            </div>
          )}
        </div>

        {/* ═══ DETAIL MODAL ═══ */}
        <Dialog open={!!selectedFeedback} onOpenChange={() => setSelectedFeedback(null)}>
          <DialogContent className="bg-black border-2 border-green-500 text-green-400 max-w-3xl font-mono shadow-[0_0_50px_rgba(34,197,94,0.3)]">
            <DialogHeader>
              <DialogTitle className="text-2xl text-green-500 flex items-center gap-2">
                <Zap className="w-6 h-6" />
                FEEDBACK_DETAILS
              </DialogTitle>
            </DialogHeader>
            {selectedFeedback && (
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                {/* Personal Info */}
                <div className="border border-green-500/30 p-4 bg-green-500/5">
                  <p className="text-gray-500 text-xs mb-2">&gt; OPERATIVE_INFO</p>
                  <p className="text-lg font-bold mb-2">{selectedFeedback.name}</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">ROLL:</span> {selectedFeedback.rollNo}
                    </div>
                    <div>
                      <span className="text-gray-500">YEAR:</span> {selectedFeedback.year}
                    </div>
                    <div>
                      <span className="text-gray-500">BRANCH:</span> {selectedFeedback.branch}
                    </div>
                    <div>
                      <span className="text-gray-500">SECTION:</span> {selectedFeedback.section}
                    </div>
                  </div>
                </div>

                {/* Ratings */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="border border-green-500/30 p-3 bg-green-500/5 text-center">
                    <p className="text-gray-500 text-xs mb-1">OVERALL</p>
                    <p className="text-3xl font-black flex items-center justify-center gap-1">
                      {selectedFeedback.overallRating}
                      <Star className="w-5 h-5 fill-green-500" />
                    </p>
                  </div>
                  <div className="border border-green-500/30 p-3 bg-green-500/5 text-center">
                    <p className="text-gray-500 text-xs mb-1">ENGAGEMENT</p>
                    <p className="text-3xl font-black flex items-center justify-center gap-1">
                      {selectedFeedback.engagementRating}
                      <Star className="w-5 h-5 fill-green-500" />
                    </p>
                  </div>
                  <div className="border border-green-500/30 p-3 bg-green-500/5 text-center">
                    <p className="text-gray-500 text-xs mb-1">UNDERSTANDING</p>
                    <p className="text-3xl font-black flex items-center justify-center gap-1">
                      {selectedFeedback.understandingRating}
                      <Star className="w-5 h-5 fill-green-500" />
                    </p>
                  </div>
                </div>

                {/* Feedback Text */}
                <div className="border border-green-500/30 p-4 bg-green-500/5">
                  <p className="text-gray-500 text-xs mb-2">&gt; WORKSHOP_ENHANCEMENT</p>
                  <p className="text-sm leading-relaxed">{selectedFeedback.workshopEnhancement}</p>
                </div>

                <div className="border border-green-500/30 p-4 bg-green-500/5">
                  <p className="text-gray-500 text-xs mb-2">&gt; SUGGESTIONS</p>
                  <p className="text-sm leading-relaxed">{selectedFeedback.suggestions}</p>
                </div>

                <div className="text-right text-xs text-gray-600">
                  <p>&gt; TIMESTAMP: {selectedFeedback.timestamp}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}