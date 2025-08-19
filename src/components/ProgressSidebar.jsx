import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { X, Calendar, Target, Trophy, Flame } from 'lucide-react'

const ProgressSidebar = ({ 
  isOpen, 
  onClose, 
  workoutProgress, 
  dayProgress, 
  weekProgress, 
  warmUpData, 
  exercises,
  getCurrentStage 
}) => {
  if (!isOpen) return null

  // Calculate detailed progress
  const getDetailedProgress = () => {
    let exerciseIndex = 0
    const sections = []

    // Treadmill
    sections.push({
      name: 'Treadmill',
      exercises: [{ name: 'Walking on a treadmill', completed: workoutProgress[exerciseIndex] || false }]
    })
    exerciseIndex++

    // Warm-up
    const warmupExercises = warmUpData.map(exercise => {
      const exerciseProgress = []
      for (let i = 0; i < parseInt(exercise.rounds); i++) {
        exerciseProgress.push(workoutProgress[exerciseIndex] || false)
        exerciseIndex++
      }
      return {
        name: exercise.name,
        rounds: exerciseProgress,
        completed: exerciseProgress.every(Boolean)
      }
    })
    sections.push({
      name: 'Warm-up',
      exercises: warmupExercises
    })

    // Main workout
    const workoutExercises = exercises.map(exercise => {
      const exerciseProgress = []
      for (let i = 0; i < parseInt(exercise.rounds); i++) {
        exerciseProgress.push(workoutProgress[exerciseIndex] || false)
        exerciseIndex++
      }
      return {
        name: exercise.name,
        rounds: exerciseProgress,
        completed: exerciseProgress.every(Boolean)
      }
    })
    sections.push({
      name: 'Main Workout',
      exercises: workoutExercises
    })

    // Cardio
    sections.push({
      name: 'Cardio',
      exercises: [{ name: 'The Cardio', completed: workoutProgress[exerciseIndex] || false }]
    })

    return sections
  }

  const sections = getDetailedProgress()
  const totalCompleted = workoutProgress.filter(Boolean).length
  const totalExercises = workoutProgress.length
  const completionPercentage = totalExercises > 0 ? (totalCompleted / totalExercises) * 100 : 0

  return (
    <>
      {/* Overlay */}
      <div 
        className="sidebar-overlay" 
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }} 
      />
      
      {/* Sidebar */}
      <div className="sidebar" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 h-full overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Workout Progress</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Overall Progress */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5" />
                Today's Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Completed</span>
                  <span>{totalCompleted}/{totalExercises}</span>
                </div>
                <Progress value={completionPercentage} className="h-2" />
                <div className="text-center text-sm text-muted-foreground">
                  {Math.round(completionPercentage)}% Complete
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Stats */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Weekly Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{dayProgress}</div>
                  <div className="text-xs text-muted-foreground">Day</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{weekProgress}</div>
                  <div className="text-xs text-muted-foreground">Week</div>
                </div>
              </div>
              <div className="mt-3 text-center">
                <Badge variant="outline">
                  Stage {getCurrentStage() + 1}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Progress */}
          <div className="space-y-4">
            {sections.map((section, sectionIndex) => (
              <Card key={sectionIndex}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    {section.name === 'Warm-up' && <Flame className="w-4 h-4" />}
                    {section.name === 'Main Workout' && <Trophy className="w-4 h-4" />}
                    {(section.name === 'Treadmill' || section.name === 'Cardio') && <Target className="w-4 h-4" />}
                    {section.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {section.exercises.map((exercise, exerciseIndex) => (
                      <div key={exerciseIndex} className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {exercise.name}
                          </div>
                          {exercise.rounds && (
                            <div className="flex gap-1 mt-1">
                              {exercise.rounds.map((completed, roundIndex) => (
                                <div
                                  key={roundIndex}
                                  className={`w-2 h-2 rounded-full ${
                                    completed ? 'bg-primary' : 'bg-muted'
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="ml-2">
                          {exercise.completed ? (
                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-muted" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-border">
            <div className="text-center text-sm text-muted-foreground">
              Keep going! You're doing great! 💪
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ProgressSidebar

