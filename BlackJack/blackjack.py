# Blackjack, se regler på http://www.hitorstand.net/strategy.php
import random
from card import *
from os import system


def input_j_n(input_string):
    """
    Säker inmatning av ja/nej-svar
    Parameter: Ledtext
    Returvärde: True / False beroende på svar
    """
    indata = None
    while 1:
        indata = input(input_string)
        if indata in {"j", "J"}:
            return True
        elif indata in {"n", "N"}:
            return False
        else:
            print("Du måste svara j eller n")


def make_deck():
    """
    Skapar en kortlek
    Parameter: Ingen
    Returvärde: En lista med kort i form av objekt av klassen Card
    Kortleken är blandad vid retur
    """
    suits = ["Hearts", "Spades", "Clubs", "Diamonds"]
    ranks = list(map(str, range(2, 11)))
    ranks.extend(["Jack", "Queen", "King", "Ace"])
    suits = suits * 13  # Lista med färger
    ranks = ranks * 4  # Lista med valörer

    deck = []  # Ska bli lista med kort
    while len(suits) > 0:
        deck.append(Card(suits.pop(), ranks.pop()))
    random.shuffle(deck)

    return deck


def show_cards(hand, text="", hidden=True):
    """
    Visar korten, använder klassen Card för att visa ascii-bild
    Parameter: En lista med de kort (av klassen Card) som ska visas
    Returvärde: Inget
    """
    print()
    print(text)
    if hidden:
        print(f"{ascii_version_of_hidden_card(*hand)} ")
    else:
        print(f"{ascii_version_of_card(*hand)} Summa: {calc_scores(hand)[0]}")


def players_turn(players_hand):
    """
    Funktion som drar nya kort, ett i taget, tills spelaren är nöjd
    Funktionen avbryts om spelaren nått över 21 enl. spelregler
    Parameter: En lista med de initiala korten som spelaren har på hand
    Returvärde: En lista med de slutgiltiga korten som spelaren fått på hand
    """
    while True:
        show_cards(players_hand, "Dina kort:", hidden=False)
        show_cards(dealers_cards, "Datorns kort")
        play = input_j_n("Vill du ta ett kort till? (j/n) -> ")
        if not play:
            break
        players_hand.append(deck.pop())
        scores, _ = calc_scores(players_hand)
        if scores > 21:
            break
    return players_hand


def dealers_turn(dealers_hand):
    """
    Funktion som drar nya kort, ett i taget, tills givaren fått minst 17 "poäng" på hand
    Parameter: En lista med de initiala korten som givaren har på hand
    Returvärde: En lista med de slutgiltiga korten som givaren fått på hand
    """
    dealers_sum = dealers_hand[0].points + dealers_hand[1].points
    while dealers_sum < 17:
        print(
            f"Poäng innan ökning: {calc_scores(dealers_hand)[0]}, {dealers_sum}")
        print("NU!")
        dealers_hand.append(deck.pop())
        dealers_sum = calc_scores(dealers_hand)[0]
        print(f"Poäng efter ökning: {dealers_sum}")
    return dealers_hand


def calc_scores(hand):
    """
    Funktion som beräknar poängen på korten som spelare eller givare har på hand
    Parameter: En lista med kort av klassen Card
    Returvärde: En tupel med (poängen, status), där status kan vara "blackjack" eller "busted"
    """
    scores = 0
    aces = 0
    status = None
    for card in hand:
        scores += card.points
        if card.points == 11:
            aces += 1  # Håll koll på antalet ess eftersom poängen räknas olika
    while scores > 21 and aces > 0:
        scores -= 10
        aces -= 1
    if len(hand) == 2 and scores == 21:
        status = "blackjack"
    elif scores > 21:
        status = "busted"
    return scores, status


###### Huvudprogram #####
game_on = True
while game_on:
    # Rensa skärmen
    system("cls || clear")  # cls för Windows, clear för mac och linux
    # Några variabeldeklarationer
    player_score = 0
    dealer_score = 0
    player_status = None
    dealer_status = None
    dealers_cards = []
    players_cards = []

    # Skapa kortleken
    deck = make_deck()
    # Dra de två första korten för spelare resp. givare
    for _ in range(2):
        players_cards.append(deck.pop())
        dealers_cards.append(deck.pop())

    # Spelarens drag och poängräkning
    players_cards = players_turn(players_cards)
    player_score, player_status = calc_scores(players_cards)

    # Datorns drag och poängräkning
    dealers_cards = dealers_turn(dealers_cards)
    dealer_score, dealer_status = calc_scores(dealers_cards)

    # Redovisa utfallen
    show_cards(players_cards, "Dina kort:", hidden=False)
    show_cards(dealers_cards, "Datorns kort:", hidden=False)

    if player_status == "blackjack":
        print("BlackJack, du vann! 🎉")
    elif player_status == "busted":
        print("Du förlorade 🙁")
    elif player_score > dealer_score:
        print("Du vann! 🎉")
    elif dealer_status == "busted":
        print("Du vann!")
    else:
        print("Du förlorade 🙁")
    print(player_score, dealer_score)

    # Spela igen?
    game_on = input_j_n("En omgång till? (j/n) -> ")
    deck = make_deck()
