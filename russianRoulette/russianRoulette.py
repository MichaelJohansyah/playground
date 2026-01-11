import random

class RussianRoulette:
    def __init__(self):
        self.mode = None
        self.shots_fired = 0
        self.survived = False
        
    def display_menu(self):
        """Display main menu and get user's mode choice"""
        print("\n" + "="*50)
        print("RUSSIAN ROULETTE GAME")
        print("="*50)
        print("\nChoose a mode:")
        print("1. CLASSIC MODE - 6 chances to shoot (6th shot always kills)")
        print("2. SPIN MODE - Revolver has 1 bullet in 6 chambers (can spin anytime)")
        print("\nEnter your choice (1 or 2): ", end="")
        
        while True:
            try:
                choice = int(input())
                if choice in [1, 2]:
                    self.mode = choice
                    return choice
                else:
                    print("Invalid choice. Please enter 1 or 2: ", end="")
            except ValueError:
                print("Invalid input. Please enter a number (1 or 2): ", end="")
    
    def play_classic_mode(self):
        """
        Mode 1: 6 chances to shoot
        Shots 1-5 are safe, shot 6 always kills
        """
        print("\n" + "-"*50)
        print("CLASSIC MODE - 6 CHANCES")
        print("-"*50)
        print("You have 6 chances. The 6th shot will ALWAYS kill you!")
        print("Can you survive 5 shots?\n")
        
        for shot in range(1, 7):
            self.shots_fired = shot
            print(f"Shot #{shot}/6", end=" - ")
            input("Press Enter to pull the trigger...")
            
            if shot < 6:
                print("💨 CLICK! You survived! The chamber was empty...")
            else:
                print("💥 BANG! You're dead! The 6th shot always kills...")
                self.survived = False
                return
        
        self.survived = True
    
    def play_spin_mode(self):
        """
        Mode 2: Spin mode
        Revolver has 1 bullet in 6 chambers
        Player can spin before each shot to randomize chamber
        """
        print("\n" + "-"*50)
        print("SPIN MODE - 1 BULLET IN 6 CHAMBERS")
        print("-"*50)
        print("Revolver has 1 bullet in 6 chambers.")
        print("You can spin the cylinder before each shot.")
        print("Let's see how many shots you can survive!\n")
        
        # Create revolver with 1 bullet (position 0-5)
        bullet_position = random.randint(0, 5)
        shots_count = 0
        
        while True:
            shots_count += 1
            self.shots_fired = shots_count
            
            print(f"\nShot #{shots_count}")
            print("1. Spin the cylinder (randomize position)")
            print("2. Pull the trigger (without spinning)")
            print("Choose (1 or 2): ", end="")
            
            while True:
                try:
                    choice = int(input())
                    if choice in [1, 2]:
                        break
                    else:
                        print("Invalid choice. Enter 1 or 2: ", end="")
                except ValueError:
                    print("Invalid input. Enter 1 or 2: ", end="")
            
            if choice == 1:
                bullet_position = random.randint(0, 5)
                print("🔄 You spin the cylinder...")
            
            input("Press Enter to pull the trigger...")
            
            if bullet_position == 0:
                print("💥 BANG! You're dead! The bullet got you...")
                self.survived = False
                return
            else:
                print(f"💨 CLICK! You survived! The chamber was empty...")
                bullet_position -= 1  # Move to next chamber
            
            # Ask if player wants to continue
            if shots_count > 0:
                print(f"\nYou've survived {shots_count} shot(s)!")
                print("Do you want to continue? (yes/no): ", end="")
                
                while True:
                    cont = input().strip().lower()
                    if cont in ['yes', 'no', 'y', 'n']:
                        break
                    else:
                        print("Please enter 'yes' or 'no': ", end="")
                
                if cont in ['no', 'n']:
                    print(f"\n✅ You wisely quit after {shots_count} shot(s)! You're alive!")
                    self.survived = True
                    return
    
    def display_results(self):
        """Display game results"""
        print("\n" + "="*50)
        print("GAME OVER")
        print("="*50)
        print(f"Mode: {'CLASSIC' if self.mode == 1 else 'SPIN'}")
        print(f"Shots fired: {self.shots_fired}")
        if self.survived:
            print("Status: ✅ SURVIVED!")
        else:
            print("Status: ❌ DIED!")
        print("="*50 + "\n")
    
    def play(self):
        """Main game loop"""
        self.display_menu()
        
        if self.mode == 1:
            self.play_classic_mode()
        else:
            self.play_spin_mode()
        
        self.display_results()
        
        # Ask to play again
        print("Do you want to play again? (yes/no): ", end="")
        while True:
            again = input().strip().lower()
            if again in ['yes', 'no', 'y', 'n']:
                break
            else:
                print("Please enter 'yes' or 'no': ", end="")
        
        if again in ['yes', 'y']:
            self.reset()
            self.play()
    
    def reset(self):
        """Reset game state for new game"""
        self.mode = None
        self.shots_fired = 0
        self.survived = False


def main():
    """Main entry point"""
    try:
        game = RussianRoulette()
        game.play()
        print("Thanks for playing! Goodbye!")
    except KeyboardInterrupt:
        print("\n\nGame interrupted. Goodbye!")


if __name__ == "__main__":
    main()
