import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Play, Pause, RotateCcw, Youtube, ArrowRight, Home } from 'lucide-react'

const WorkoutSession = ({ 
  exercises, 
  warmUpData, 
  onComplete, 
  onExit,
  cardioDuration 
}) => {
  const [currentPhase, setCurrentPhase] = useState('treadmill') // treadmill, warmup, workout, cardio, complete
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [currentRound, setCurrentRound] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isResting, setIsResting] = useState(false)
  const [sessionStarted, setSessionStarted] = useState(false)

  const audioRef = useRef(null)
  const intervalRef = useRef(null)

  // Audio files
  const whistleStart = '/src/assets/whistle-start.wav'
  const whistleRest = '/src/assets/whistle-rest.wav'

  // Play sound
  const playSound = (soundFile) => {
    try {
      const audio = new Audio(soundFile)
      audio.play().catch(e => console.log('Audio play failed:', e))
    } catch (e) {
      console.log('Audio creation failed:', e)
    }
  }

  // Get current exercise data
  const getCurrentExercise = () => {
    switch (currentPhase) {
      case 'treadmill':
        return { name: 'Walking on a treadmill', type: 'timer', duration: 15 * 60, rounds: 1 }
      case 'warmup':
        return warmUpData[currentExerciseIndex] || null
      case 'workout':
        return exercises[currentExerciseIndex] || null
      case 'cardio':
        return { name: 'The Cardio', type: 'timer', duration: cardioDuration * 60, rounds: 1 }
      default:
        return null
    }
  }

  // Get total progress
  const getTotalProgress = () => {
    let total = 0
    let completed = 0

    // Treadmill
    total += 1
    if (currentPhase !== 'treadmill') completed += 1

    // Warmup
    total += warmUpData.length
    if (currentPhase === 'warmup') {
      completed += currentExerciseIndex
    } else if (currentPhase === 'workout' || currentPhase === 'cardio' || currentPhase === 'complete') {
      completed += warmUpData.length
    }

    // Workout
    total += exercises.length
    if (currentPhase === 'workout') {
      completed += currentExerciseIndex
    } else if (currentPhase === 'cardio' || currentPhase === 'complete') {
      completed += exercises.length
    }

    // Cardio
    total += 1
    if (currentPhase === 'complete') completed += 1

    return { completed, total, percentage: (completed / total) * 100 }
  }

  // Start session
  const startSession = () => {
    setSessionStarted(true)
    setIsActive(true)
    playSound(whistleStart)
    
    const exercise = getCurrentExercise()
    if (exercise && exercise.type === 'timer') {
      setTimeRemaining(exercise.duration)
    }
  }

  // Pause/Resume
  const togglePause = () => {
    setIsPaused(!isPaused)
    setIsActive(!isPaused)
  }

  // Next exercise/round
  const nextItem = () => {
    const exercise = getCurrentExercise()
    
    if (!exercise) return

    if (exercise.type === 'timer' || currentRound >= parseInt(exercise.rounds) - 1) {
      // Move to next exercise
      nextExercise()
    } else {
      // Next round
      setCurrentRound(currentRound + 1)
      setIsResting(true)
      setTimeRemaining(15) // 15 second rest
      playSound(whistleRest)
    }
  }

  // Next exercise
  const nextExercise = () => {
    setCurrentRound(0)
    setIsResting(false)

    switch (currentPhase) {
      case 'treadmill':
        setCurrentPhase('warmup')
        setCurrentExerciseIndex(0)
        break
      case 'warmup':
        if (currentExerciseIndex >= warmUpData.length - 1) {
          setCurrentPhase('workout')
          setCurrentExerciseIndex(0)
        } else {
          setCurrentExerciseIndex(currentExerciseIndex + 1)
        }
        break
      case 'workout':
        if (currentExerciseIndex >= exercises.length - 1) {
          setCurrentPhase('cardio')
          setCurrentExerciseIndex(0)
          setTimeRemaining(cardioDuration * 60)
        } else {
          setCurrentExerciseIndex(currentExerciseIndex + 1)
        }
        break
      case 'cardio':
        setCurrentPhase('complete')
        setIsActive(false)
        onComplete()
        break
    }
  }

  // Timer effect
  useEffect(() => {
    if (isActive && !isPaused && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(time => {
          if (time <= 1) {
            if (isResting) {
              setIsResting(false)
              playSound(whistleStart)
              return 0
            } else {
              nextItem()
              return 0
            }
          }
          return time - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }

    return () => clearInterval(intervalRef.current)
  }, [isActive, isPaused, timeRemaining, isResting])

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const exercise = getCurrentExercise()
  const progress = getTotalProgress()

  if (currentPhase === 'complete') {
    return (
      <div className="workout-session">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-primary mb-4">Workout Complete!</h2>
            <p className="text-muted-foreground mb-6">
              Congratulations! You've completed today's workout session.
            </p>
            <div className="space-y-3">
              <Button onClick={onComplete} className="w-full workout-button">
                Finish & Save Progress
              </Button>
              <Button onClick={onExit} variant="outline" className="w-full">
                <Home className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!sessionStarted) {
    return (
      <div className="workout-session">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Ready to Start?</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="mb-6">
              <div className="text-4xl mb-4">💪</div>
              <p className="text-muted-foreground">
                Your workout session will begin with a whistle sound. 
                Follow the exercises step by step with guided rest periods.
              </p>
            </div>
            <div className="space-y-3">
              <Button onClick={startSession} className="w-full workout-button pulse-animation">
                <Play className="w-4 h-4 mr-2" />
                Start Workout Session
              </Button>
              <Button onClick={onExit} variant="outline" className="w-full">
                Back to Exercises
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="workout-session">
      <div className="max-w-md w-full">
        {/* Progress */}
        <Card className="mb-6">
          <CardContent className="pt-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Progress</span>
              <span>{progress.completed}/{progress.total}</span>
            </div>
            <Progress value={progress.percentage} className="h-2" />
          </CardContent>
        </Card>

        {/* Current Exercise */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center">
              {isResting ? 'Rest Time' : exercise?.name || 'Exercise'}
            </CardTitle>
            <div className="text-center text-sm text-muted-foreground">
              {currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)}
              {exercise && exercise.rounds && !isResting && (
                <span> - Round {currentRound + 1}/{exercise.rounds}</span>
              )}
            </div>
          </CardHeader>
          <CardContent className="text-center">
            {/* Timer Display */}
            {(exercise?.type === 'timer' || isResting) && (
              <div className="timer-display">
                {formatTime(timeRemaining)}
              </div>
            )}

            {/* Exercise Info */}
            {!isResting && exercise && (
              <div className="mb-6">
                {exercise.counts && (
                  <div className="text-lg text-muted-foreground mb-2">
                    {exercise.counts} Counts
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`https://m.youtube.com/results?search_query=${exercise.name}`, '_blank')}
                >
                  <Youtube className="w-4 h-4 mr-2" />
                  How to perform
                </Button>
              </div>
            )}

            {/* Rest Message */}
            {isResting && (
              <div className="mb-6">
                <div className="text-lg text-primary mb-2">Take a 15-second break</div>
                <div className="text-sm text-muted-foreground">
                  Get ready for round {currentRound + 1}
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="flex gap-3 justify-center">
              <Button
                onClick={togglePause}
                variant="outline"
                size="lg"
              >
                {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              </Button>
              
              {!isResting && exercise?.type !== 'timer' && (
                <Button
                  onClick={nextItem}
                  className="workout-button"
                  size="lg"
                >
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Next Round
                </Button>
              )}

              {!isResting && exercise?.type === 'timer' && (
                <Button
                  onClick={nextExercise}
                  className="workout-button"
                  size="lg"
                >
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Complete
                </Button>
              )}
            </div>

            {/* Exit Button */}
            <div className="mt-4">
              <Button onClick={onExit} variant="ghost" size="sm">
                Exit Session
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default WorkoutSession

