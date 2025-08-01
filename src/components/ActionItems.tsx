import { useState } from 'react';
import { ActionItem } from '../types';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Calendar, User, Flag, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

interface ActionItemsProps {
  items: ActionItem[];
}

export default function ActionItems({ items }: ActionItemsProps) {
  const [completedItems, setCompletedItems] = useState<string[]>([]);

  const toggleComplete = (itemId: string) => {
    setCompletedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const getPriorityIcon = (priority: ActionItem['priority']) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      case 'medium':
        return <Info className="h-4 w-4" />;
      case 'low':
        return <Flag className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: ActionItem['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  const priorityLabels = {
    high: 'Yüksek',
    medium: 'Orta',
    low: 'Düşük'
  };

  const sortedItems = [...items].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  if (items.length === 0) {
    return (
      <Card className="p-12 text-center bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CheckCircle2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">
          Aksiyon maddesi yok
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Aksiyon Özeti
          </h3>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {items.length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Toplam
              </p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
                {completedItems.length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Tamamlanan
              </p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-2xl font-semibold text-red-600 dark:text-red-400">
                {items.filter(item => item.priority === 'high').length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Yüksek Öncelik
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Action Items List */}
      <div className="space-y-4">
        <AnimatePresence>
          {sortedItems.map((item, index) => {
            const isCompleted = completedItems.includes(item.id);
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={cn(
                    "p-6 transition-all duration-200",
                    isCompleted
                      ? "bg-gray-50 dark:bg-gray-800/50 opacity-75"
                      : "bg-white dark:bg-gray-900",
                    "border-gray-200 dark:border-gray-800"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={isCompleted}
                      onCheckedChange={() => toggleComplete(item.id)}
                      className="mt-0.5"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className={cn(
                            "text-gray-900 dark:text-white font-medium",
                            isCompleted && "line-through text-gray-500 dark:text-gray-400"
                          )}>
                            {item.description}
                          </p>
                          
                          <div className="flex items-center gap-4 mt-3">
                            {/* Priority */}
                            <Badge
                              variant="secondary"
                              className={cn(
                                "flex items-center gap-1",
                                getPriorityColor(item.priority)
                              )}
                            >
                              {getPriorityIcon(item.priority)}
                              {priorityLabels[item.priority]}
                            </Badge>
                            
                            {/* Assignee */}
                            {item.assignee && (
                              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                <User className="h-4 w-4" />
                                <span>{item.assignee}</span>
                              </div>
                            )}
                            
                            {/* Due Date */}
                            {item.dueDate && (
                              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {new Intl.DateTimeFormat('tr-TR', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                  }).format(item.dueDate)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Status indicator */}
                        {isCompleted && (
                          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Progress Summary */}
      {completedItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                  İlerleme Durumu
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {items.length} aksiyondan {completedItems.length} tanesi tamamlandı
                </p>
              </div>
              
              <div className="text-right">
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  %{Math.round((completedItems.length / items.length) * 100)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Tamamlandı
                </p>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(completedItems.length / items.length) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                />
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}