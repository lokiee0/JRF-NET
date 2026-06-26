import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle2, Circle, Sparkles, Clock, Target } from 'lucide-react';
import { plannerApi } from '../../api/planner';
import { Card, Button, Spinner, EmptyState, Badge } from '../../components/ui';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function PlannerPage() {
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery({
    queryKey: ['todayPlan'],
    queryFn: () => plannerApi.getTodayPlan(),
  });

  const generateMutation = useMutation({
    mutationFn: () => plannerApi.generateTodayPlan(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todayPlan'] }),
  });

  const regenerateMutation = useMutation({
    mutationFn: async () => {
      await plannerApi.deleteTodayPlan();
      return plannerApi.generateTodayPlan();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todayPlan'] }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ planId, itemId, completed }) => plannerApi.toggleTask(planId, itemId, completed),
    onMutate: async ({ itemId, completed }) => {
      await queryClient.cancelQueries({ queryKey: ['todayPlan'] });
      const previousPlan = queryClient.getQueryData(['todayPlan']);
      
      queryClient.setQueryData(['todayPlan'], old => {
        if (!old || !old.data) return old;
        const newItems = old.data.items.map(i => i.id === itemId ? { ...i, isCompleted: completed } : i);
        return { ...old, data: { ...old.data, items: newItems } };
      });
      
      return { previousPlan };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['todayPlan'], context.previousPlan);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todayPlan'] });
    }
  });

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const plan = response?.data;
  const todayStr = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-dark-800 text-accent-400">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-100">Daily Study Plan</h1>
              <p className="text-accent-400 font-medium">{todayStr}</p>
            </div>
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className="flex gap-3 items-center">
          {plan && (
            <Button 
              variant="outline"
              onClick={() => regenerateMutation.mutate()}
              loading={regenerateMutation.isPending}
            >
              Regenerate Plan
            </Button>
          )}
        </motion.div>
      </div>

      {!plan ? (
        <motion.div variants={itemVariants}>
          <EmptyState 
            icon={Target} 
            title="No plan for today" 
            description="Let your AI mentor generate a personalized study plan based on your weak topics and upcoming revisions."
            action={{ 
              label: 'Generate AI Plan', 
              icon: <Sparkles className="w-4 h-4 mr-2" />, 
              onClick: () => generateMutation.mutate(),
              loading: generateMutation.isPending
            }}
          />
        </motion.div>
      ) : (
        <>
          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-br from-accent-500/10 to-transparent border-accent-500/30">
              <div className="flex gap-4">
                <div className="p-3 bg-dark-900 rounded-xl text-accent-400 h-fit">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-200 mb-2">AI Mentor's Strategy</h3>
                  <p className="text-gray-300 leading-relaxed">{plan.aiRecommendation}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
              <Target className="w-5 h-5 text-gray-400" /> Today's Tasks
            </h3>
            
            <div className="grid gap-3">
              {plan.items?.map(item => (
                <div 
                  key={item.id} 
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    item.isCompleted 
                      ? 'bg-dark-900/50 border-surface-border/50 opacity-75' 
                      : 'bg-dark-800 border-surface-border hover:border-accent-500/50'
                  }`}
                >
                  <button 
                    onClick={() => toggleMutation.mutate({ planId: plan.id, itemId: item.id, completed: !item.isCompleted })}
                    className={`flex-shrink-0 transition-colors ${item.isCompleted ? 'text-success' : 'text-gray-500 hover:text-accent-400'}`}
                  >
                    {item.isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                  </button>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-medium ${item.isCompleted ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                        {item.taskDescription}
                      </h4>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={item.isCompleted ? 'opacity-50' : ''}>
                        {item.topicName}
                      </Badge>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" /> {item.plannedMinutes} mins
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {plan.isCompleted && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-success/10 border border-success/30 text-center">
                <p className="text-success font-medium">🎉 Incredible! You've completed your entire study plan for today. Rest up!</p>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
