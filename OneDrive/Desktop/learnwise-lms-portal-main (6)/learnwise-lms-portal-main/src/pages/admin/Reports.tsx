
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Download, Filter, Calendar as CalendarIcon } from 'lucide-react';
import { getDashboardAnalytics } from '../../services/analyticsService';
import { useToast } from '@/components/ui/use-toast';

const AdminReports: React.FC = () => {
  const [activeTab, setActiveTab] = useState('enrollment');
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboardAnalytics'],
    queryFn: getDashboardAnalytics,
    meta: {
      onSuccess: () => {
        // Success handling if needed
      },
      onError: () => {
        toast({
          title: "Error fetching analytics",
          description: "There was a problem loading the analytics data. Please try again.",
          variant: "destructive",
        });
      }
    }
  });

  const analyticsData = data?.data || {};

  // Extract data from API response or use fallback data
  const enrollmentData = analyticsData.enrollmentByMonth || [];
  const courseCompletionData = analyticsData.courseCompletionData || [];
  const revenueData = analyticsData.revenueData || [];
  const categoryData = analyticsData.categoryDistribution || [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a162e8'];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Reports</h1>
        <p className="text-gray-400">Analytics and statistics for your learning platform</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
        <div className="flex items-center gap-4">
          <button className="bg-gray-800 text-white px-4 py-2 rounded-md flex items-center hover:bg-gray-700">
            <Filter size={16} className="mr-2" />
            Filter
          </button>
          <div className="bg-gray-800 text-white px-4 py-2 rounded-md flex items-center hover:bg-gray-700 cursor-pointer">
            <CalendarIcon size={16} className="mr-2" />
            <span>Last 12 months</span>
          </div>
        </div>
        <button className="bg-gray-800 text-white px-4 py-2 rounded-md flex items-center hover:bg-gray-700">
          <Download size={16} className="mr-2" />
          Export Report
        </button>
      </div>

      <Card className="lms-card">
        <Tabs defaultValue="enrollment" className="w-full" onValueChange={setActiveTab}>
          <div className="px-4 pt-4">
            <TabsList className="bg-gray-800 w-full grid grid-cols-2 md:grid-cols-4 mb-6">
              <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
              <TabsTrigger value="completion">Course Completion</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
            </TabsList>
          </div>

          {isLoading ? (
            <div className="text-center py-20">
              <p className="text-gray-400">Loading analytics data...</p>
            </div>
          ) : (
            <>
              <TabsContent value="enrollment" className="p-4">
                <h2 className="text-xl font-semibold text-white mb-6">Student Enrollment Trends</h2>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={enrollmentData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis dataKey="name" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#222', borderColor: '#444' }}
                        itemStyle={{ color: '#fff' }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Bar dataKey="students" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-400">Total Students</p>
                      <p className="text-xl font-bold text-white">1,590</p>
                    </div>
                    <div className="p-4 bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-400">Growth Rate</p>
                      <p className="text-xl font-bold text-green-500">+24.8%</p>
                    </div>
                    <div className="p-4 bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-400">New This Month</p>
                      <p className="text-xl font-bold text-white">120</p>
                    </div>
                    <div className="p-4 bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-400">Avg. Daily Signups</p>
                      <p className="text-xl font-bold text-white">4.2</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="completion" className="p-4">
                <h2 className="text-xl font-semibold text-white mb-6">Course Completion Rates</h2>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={courseCompletionData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis dataKey="name" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#222', borderColor: '#444' }}
                        itemStyle={{ color: '#fff' }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Bar dataKey="total" fill="#64748b" />
                      <Bar dataKey="completed" fill="#22c55e" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-400">Avg. Completion Rate</p>
                      <p className="text-xl font-bold text-white">68.3%</p>
                    </div>
                    <div className="p-4 bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-400">Highest Completion</p>
                      <p className="text-xl font-bold text-white">Web Dev (83%)</p>
                    </div>
                    <div className="p-4 bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-400">Lowest Completion</p>
                      <p className="text-xl font-bold text-white">Data Science (70%)</p>
                    </div>
                    <div className="p-4 bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-400">Total Certificates</p>
                      <p className="text-xl font-bold text-white">308</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="revenue" className="p-4">
                <h2 className="text-xl font-semibold text-white mb-6">Revenue Analysis</h2>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={revenueData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis dataKey="name" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#222', borderColor: '#444' }}
                        itemStyle={{ color: '#fff' }}
                        labelStyle={{ color: '#fff' }}
                        formatter={(value: number) => [`$${value}`, 'Revenue']}
                      />
                      <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-400">Total Revenue</p>
                      <p className="text-xl font-bold text-white">$75,200</p>
                    </div>
                    <div className="p-4 bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-400">Monthly Average</p>
                      <p className="text-xl font-bold text-white">$6,267</p>
                    </div>
                    <div className="p-4 bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-400">Growth YoY</p>
                      <p className="text-xl font-bold text-green-500">+18.4%</p>
                    </div>
                    <div className="p-4 bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-400">Projected Annual</p>
                      <p className="text-xl font-bold text-white">$98,500</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="categories" className="p-4">
                <h2 className="text-xl font-semibold text-white mb-6">Course Categories Distribution</h2>
                <div className="h-[400px] w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={140}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend 
                        formatter={(value) => <span style={{ color: '#fff' }}>{value}</span>}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#222', borderColor: '#444' }}
                        itemStyle={{ color: '#fff' }}
                        labelStyle={{ color: '#fff' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {categoryData.map((category, index) => (
                      <div key={index} className="p-4 bg-gray-800 rounded-lg">
                        <div className="flex items-center mb-1">
                          <div 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          ></div>
                          <p className="text-sm text-gray-300">{category.name}</p>
                        </div>
                        <p className="text-lg font-bold text-white">{category.value}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </Card>
    </DashboardLayout>
  );
};

export default AdminReports;
