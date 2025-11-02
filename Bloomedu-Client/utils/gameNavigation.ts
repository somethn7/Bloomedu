// Game Sequence Navigation Utility
// Kategori oyunlarının sıralı oynanması için yardımcı fonksiyonlar
import { Alert } from 'react-native';

export interface GameSequenceParams {
  child?: { id: number; level: number; name?: string };
  gameSequence?: any[];
  currentGameIndex?: number;
  categoryTitle?: string;
  resetGame?: () => void;
}

export const createGameCompletionHandler = (
  params: GameSequenceParams & { navigation: any }
) => {
  const { navigation, child, gameSequence, currentGameIndex = -1, categoryTitle, resetGame } = params;
  
  const goToNextGame = () => {
    if (gameSequence && currentGameIndex >= 0 && currentGameIndex < gameSequence.length - 1) {
      const nextGame = gameSequence[currentGameIndex + 1];
      navigation.navigate(nextGame.screen, {
        child,
        gameSequence,
        currentGameIndex: currentGameIndex + 1,
        categoryTitle,
      });
    } else {
      navigation.goBack();
    }
  };

  const createCompletionButtons = (onPlayAgain: () => void) => {
    const isInSequence = gameSequence && currentGameIndex >= 0;
    const isLastGame = isInSequence && currentGameIndex === gameSequence.length - 1;
    
    const buttons: any[] = [];
    
    if (isInSequence && !isLastGame) {
      buttons.push({ 
        text: `Next Game ➜`, 
        onPress: goToNextGame
      });
      buttons.push({ text: 'Play Again', onPress: onPlayAgain });
    } else {
      buttons.push({ text: 'Play Again', onPress: onPlayAgain });
    }
    
    buttons.push({ 
      text: 'Main Menu', 
      onPress: () => {
        // Stack'i Education -> CategoryGames şeklinde resetle
        if (categoryTitle && child) {
          navigation.reset({
            index: 1,
            routes: [
              { name: 'Education', params: { child } },
              { name: 'CategoryGames', params: { categoryTitle, child } },
            ],
          });
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Education', params: { child } }],
          });
        }
      }, 
      style: 'cancel' as const 
    });
    
    return buttons;
  };

  const getCompletionMessage = () => {
    const isInSequence = gameSequence && currentGameIndex >= 0;
    const isLastGame = isInSequence && currentGameIndex === gameSequence.length - 1;
    
    if (isInSequence && !isLastGame) {
      return `Great job! Ready for the next game? (${currentGameIndex + 2}/${gameSequence.length})`;
    }
    
    if (isInSequence && isLastGame) {
      return `Amazing! You completed all ${gameSequence.length} games in ${categoryTitle}! 🎉`;
    }
    
    return 'Great job! Want to play again?';
  };

  const showCompletionMessage = (score: number, maxScore: number, customMessage?: string) => {
    const message = customMessage || getCompletionMessage();
    const scoreText = `Score: ${score}/${maxScore}`;
    
    const onPlayAgain = () => {
      if (resetGame) {
        resetGame();
      }
    };
    
    Alert.alert(
      '🎉 Game Complete!',
      `${message}\n\n${scoreText}`,
      createCompletionButtons(onPlayAgain)
    );
  };

  return {
    goToNextGame,
    createCompletionButtons,
    getCompletionMessage,
    showCompletionMessage,
    isInSequence: gameSequence && currentGameIndex >= 0,
    isLastGame: gameSequence && currentGameIndex === gameSequence.length - 1,
    sequenceProgress: gameSequence ? `${currentGameIndex + 1}/${gameSequence.length}` : null,
  };
};

