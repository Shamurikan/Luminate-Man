import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Play, Pause, RotateCcw, Menu, Youtube, Timer, Dumbbell } from 'lucide-react'
import WorkoutSession from './components/WorkoutSession.jsx'
import ProgressSidebar from './components/ProgressSidebar.jsx'
import './App.css'

// Import JSON data
import warmUpData from './assets/warmUp.json'
import stagesData from './assets/stages.json'

function App() {
  // State management
  const [currentView, setCurrentView] = useState('dashboard') // dashboard, workout, session
  const [workoutProgress, setWorkoutProgress] = useState([])
  const [dayProgress, setDayProgress] = useState(0)
  const [weekProgress, setWeekProgress] = useState(0)
  const [isWorkoutDone, setIsWorkoutDone] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sessionState, setSessionState] = useState({
    isActive: false,
    isPaused: false,
    currentExercise: 0,
    currentRound: 0,
    timeRemaining: 0,
    isResting: false
  })

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedProgress = localStorage.getItem('workoutProgress')
    const savedDay = localStorage.getItem('dayProgress')
    const savedWeek = localStorage.getItem('weekProgress')
    const savedDone = localStorage.getItem('isWorkoutDone')
    const savedDailyChange = localStorage.getItem('dailyChange')

    const today = new Date().getDay()

    // Check if day changed
    if (savedDailyChange !== today.toString()) {
      localStorage.setItem('dailyChange', today.toString())
      const newDay = savedDay ? parseInt(savedDay) + 1 : 0
      
      if (newDay >= 7) {
        const newWeek = savedWeek ? parseInt(savedWeek) + 1 : 0
        setWeekProgress(newWeek >= 18 ? 0 : newWeek)
        setDayProgress(0)
        localStorage.setItem('weekProgress', (newWeek >= 18 ? 0 : newWeek).toString())
        localStorage.setItem('dayProgress', '0')
      } else {
        setDayProgress(newDay)
        localStorage.setItem('dayProgress', newDay.toString())
      }
      
      setIsWorkoutDone(false)
      localStorage.setItem('isWorkoutDone', 'No')
    } else {
      setDayProgress(savedDay ? parseInt(savedDay) : 0)
      setWeekProgress(savedWeek ? parseInt(savedWeek) : 0)
      setIsWorkoutDone(savedDone === 'Yes')
    }

    if (savedProgress) {
      setWorkoutProgress(JSON.parse(savedProgress))
    }
  }, [])

  // Get current stage based on week progress
  const getCurrentStage = () => {
    if (weekProgress >= 0 && weekProgress <= 5) return 0
    if (weekProgress >= 6 && weekProgress <= 11) return 1
    return 2
  }

  // Get today's workout
  const getTodaysWorkout = () => {
    const stage = getCurrentStage()
    const todayWorkout = stagesData[stage][dayProgress]
    
    if (Array.isArray(todayWorkout) && todayWorkout[0] === "Rest") {
      return { isRestDay: true, exercises: [] }
    }
    
    return { isRestDay: false, exercises: todayWorkout || [] }
  }

  // Calculate total exercises for progress tracking
  const getTotalExercises = () => {
    const { exercises } = getTodaysWorkout()
    let total = 1 // Treadmill
    total += warmUpData.reduce((sum, exercise) => sum + parseInt(exercise.rounds), 0)
    total += exercises.reduce((sum, exercise) => sum + parseInt(exercise.rounds), 0)
    total += 1 // Cardio
    return total
  }

  // Toggle exercise completion
  const toggleExerciseCompletion = (index) => {
    const newProgress = [...workoutProgress]
    if (newProgress.length === 0) {
      // Initialize progress array
      const totalExercises = getTotalExercises()
      for (let i = 0; i < totalExercises; i++) {
        newProgress.push(false)
      }
    }
    
    newProgress[index] = !newProgress[index]
    setWorkoutProgress(newProgress)
    localStorage.setItem('workoutProgress', JSON.stringify(newProgress))
  }

  // Check if all exercises are completed
  const isAllCompleted = () => {
    return workoutProgress.length > 0 && workoutProgress.every(completed => completed)
  }

  // Finish workout
  const finishWorkout = () => {
    if (isAllCompleted()) {
      setIsWorkoutDone(true)
      localStorage.setItem('isWorkoutDone', 'Yes')
      setCurrentView('dashboard')
    }
  }

  // Start workout session
  const startWorkoutSession = () => {
    setCurrentView('session')
  }

  // Complete workout session
  const completeWorkoutSession = () => {
    // Mark all exercises as completed
    const totalExercises = getTotalExercises()
    const newProgress = Array(totalExercises).fill(true)
    setWorkoutProgress(newProgress)
    localStorage.setItem('workoutProgress', JSON.stringify(newProgress))
    
    // Mark workout as done
    setIsWorkoutDone(true)
    localStorage.setItem('isWorkoutDone', 'Yes')
    
    // Return to dashboard
    setCurrentView('dashboard')
  }

  // Render dashboard
  const renderDashboard = () => (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Luminate</h1>
          <p className="text-muted-foreground">Professional Workout System</p>
        </div>

        {/* Progress Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5" />
              Workout Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{dayProgress}</div>
                <div className="text-sm text-muted-foreground">Day</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{weekProgress}</div>
                <div className="text-sm text-muted-foreground">Week</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{getCurrentStage() + 1}</div>
                <div className="text-sm text-muted-foreground">Stage</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {workoutProgress.filter(Boolean).length}/{workoutProgress.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
            </div>
            <Progress 
              value={workoutProgress.length > 0 ? (workoutProgress.filter(Boolean).length / workoutProgress.length) * 100 : 0} 
              className="h-2"
            />
          </CardContent>
        </Card>

        {/* Today's Status */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            {isWorkoutDone ? (
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500 mb-2">Workout Complete! 🎉</div>
                <p className="text-muted-foreground">Great job! Come back tomorrow for your next workout.</p>
              </div>
            ) : getTodaysWorkout().isRestDay ? (
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500 mb-2">Rest Day 😌</div>
                <p className="text-muted-foreground">Take a well-deserved break today!</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-2xl font-bold mb-4">Ready for Today's Workout?</div>
                <div className="flex gap-4 justify-center">
                  <Button onClick={() => setCurrentView('workout')} className="workout-button">
                    View Exercises
                  </Button>
                  <Button onClick={startWorkoutSession} variant="outline">
                    <Play className="w-4 h-4 mr-2" />
                    Start Session
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <Timer className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-lg font-semibold">Cardio Duration</div>
              <div className="text-muted-foreground">
                {getCurrentStage() === 0 ? '30' : getCurrentStage() === 1 ? '45' : '60'} Minutes
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Dumbbell className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-lg font-semibold">Exercises Today</div>
              <div className="text-muted-foreground">
                {getTodaysWorkout().isRestDay ? '0' : getTodaysWorkout().exercises.length + warmUpData.length + 2}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Badge variant="outline" className="text-lg px-4 py-2">
                Stage {getCurrentStage() + 1}
              </Badge>
              <div className="text-sm text-muted-foreground mt-2">Current Level</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )

  // Render workout view
  const renderWorkout = () => {
    const { exercises, isRestDay } = getTodaysWorkout()
    
    if (isRestDay) {
      return (
        <div className="min-h-screen bg-background p-4 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="pt-6 text-center">
              <div className="text-4xl mb-4">😌</div>
              <h2 className="text-2xl font-bold mb-2">Rest Day</h2>
              <p className="text-muted-foreground mb-4">Take a well-deserved break today!</p>
              <Button onClick={() => setCurrentView('dashboard')}>
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    let exerciseIndex = 0

    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" onClick={() => setCurrentView('dashboard')}>
              ← Back
            </Button>
            <h1 className="text-2xl font-bold">Today's Workout</h1>
            <Button variant="outline" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-4 h-4" />
            </Button>
          </div>

          {/* Progress Sidebar */}
          <ProgressSidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            workoutProgress={workoutProgress}
            dayProgress={dayProgress}
            weekProgress={weekProgress}
            warmUpData={warmUpData}
            exercises={exercises}
            getCurrentStage={getCurrentStage}
          />

          {/* Treadmill */}
          <Card className="workout-card mb-6">
            <CardHeader>
              <CardTitle className="exercise-title">
                Walking on a treadmill
                <Youtube 
                  className="youtube-icon" 
                  onClick={() => window.open(`https://m.youtube.com/results?search_query=treadmill+walking`, '_blank')}
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="exercise-info">15 Minutes</div>
              <div className="exercise-progress-bar">
                <div 
                  className={`progress-dot ${workoutProgress[exerciseIndex] ? 'completed' : ''}`}
                  onClick={() => toggleExerciseCompletion(exerciseIndex)}
                />
              </div>
            </CardContent>
          </Card>

          {exerciseIndex++}

          {/* Warm-up Exercises */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-primary">Warm-up</h2>
            {warmUpData.map((exercise, idx) => {
              const startIndex = exerciseIndex
              const dots = []
              for (let i = 0; i < parseInt(exercise.rounds); i++) {
                dots.push(
                  <div 
                    key={i}
                    className={`progress-dot ${workoutProgress[exerciseIndex] ? 'completed' : ''}`}
                    onClick={() => toggleExerciseCompletion(exerciseIndex)}
                  />
                )
                exerciseIndex++
              }

              return (
                <Card key={idx} className="workout-card mb-4">
                  <CardHeader>
                    <CardTitle className="exercise-title">
                      {exercise.name}
                      <Youtube 
                        className="youtube-icon" 
                        onClick={() => window.open(`https://m.youtube.com/results?search_query=${exercise.name}`, '_blank')}
                      />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="exercise-info">{exercise.counts} Counts</div>
                    <div className="exercise-progress-bar">{dots}</div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Main Exercises */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-primary">Main Workout</h2>
            {exercises.map((exercise, idx) => {
              const dots = []
              for (let i = 0; i < parseInt(exercise.rounds); i++) {
                dots.push(
                  <div 
                    key={i}
                    className={`progress-dot ${workoutProgress[exerciseIndex] ? 'completed' : ''}`}
                    onClick={() => toggleExerciseCompletion(exerciseIndex)}
                  />
                )
                exerciseIndex++
              }

              return (
                <Card key={idx} className="workout-card mb-4">
                  <CardHeader>
                    <CardTitle className="exercise-title">
                      {exercise.name}
                      <Youtube 
                        className="youtube-icon" 
                        onClick={() => window.open(`https://m.youtube.com/results?search_query=${exercise.name}`, '_blank')}
                      />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="exercise-info">{exercise.counts} Counts</div>
                    <div className="exercise-progress-bar">{dots}</div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Cardio */}
          <Card className="workout-card mb-6">
            <CardHeader>
              <CardTitle className="exercise-title">
                The Cardio
                <Youtube 
                  className="youtube-icon" 
                  onClick={() => window.open(`https://m.youtube.com/results?search_query=cardio+workout`, '_blank')}
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="exercise-info">
                {getCurrentStage() === 0 ? '30' : getCurrentStage() === 1 ? '45' : '60'} Minutes
              </div>
              <div className="exercise-progress-bar">
                <div 
                  className={`progress-dot ${workoutProgress[exerciseIndex] ? 'completed' : ''}`}
                  onClick={() => toggleExerciseCompletion(exerciseIndex)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Finish Button */}
          <Card className={`mb-6 ${isAllCompleted() ? 'bg-primary' : 'bg-muted'}`}>
            <CardContent className="pt-6">
              <Button 
                onClick={finishWorkout}
                disabled={!isAllCompleted()}
                className="w-full text-lg py-6"
                variant={isAllCompleted() ? "default" : "secondary"}
              >
                {isAllCompleted() ? 'Finish Workout 🎉' : 'Complete All Exercises First'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Render workout session
  const renderSession = () => {
    const { exercises } = getTodaysWorkout()
    const cardioDuration = getCurrentStage() === 0 ? 30 : getCurrentStage() === 1 ? 45 : 60

    return (
      <WorkoutSession
        exercises={exercises}
        warmUpData={warmUpData}
        cardioDuration={cardioDuration}
        onComplete={completeWorkoutSession}
        onExit={() => setCurrentView('workout')}
      />
    )
  }

  // Main render
  return (
    <div className="min-h-screen bg-background">
      {currentView === 'dashboard' && renderDashboard()}
      {currentView === 'workout' && renderWorkout()}
      {currentView === 'session' && renderSession()}
    </div>
  )
}

export default App

