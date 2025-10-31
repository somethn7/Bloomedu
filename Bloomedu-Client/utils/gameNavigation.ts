// Game Sequence Navigation Utility
// Kategori oyunlarının sıralı oynanması için yardımcı fonksiyonlar

export interface GameSequenceParams {
  child?: { id: number; level: number; name?: string };
  gameSequence?: any[];
  currentGameIndex?: number;
  categoryTitle?: string;
}

export const createGameCompletionHandler = (
  navigation: any,
  params: GameSequenceParams,
  onPlayAgain: () => void
) => {
  const { child, gameSequence, currentGameIndex = -1, categoryTitle } = params;
  
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

  const createCompletionButtons = () => {
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
    
    buttons.push({ text: 'Main Menu', onPress: () => navigation.goBack(), style: 'cancel' as const });
    
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

  return {
    goToNextGame,
    createCompletionButtons,
    getCompletionMessage,
    isInSequence: gameSequence && currentGameIndex >= 0,
    isLastGame: gameSequence && currentGameIndex === gameSequence.length - 1,
    sequenceProgress: gameSequence ? `${currentGameIndex + 1}/${gameSequence.length}` : null,
  };
};

