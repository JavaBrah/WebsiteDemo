
import random
class Node():
    def __init__(self, value):
        self.value = value
        self.next = None

class LinkedList():
    def __init__(self):
        self.head = None

    def addNode(self, node):
        if self.head is None:
            self.head = node
            return
        
        current = self.head
        while current:
            if current.next is None:
                current.next = node
                return
                
    def insertNode(self, node, position):
        if position < 1:
            return "Invalid position"
        if self.head is None or position == 1:
            self.head = node
            node.next = self.head
            return "List was empty: node position at head"
        current = self.head
        prev = None
        count = 1
        while current and count < position:
            prev = current
            current = current.next
            count+=1
        if not current:
            prev = node
            return "Position extends linked list/ node added to end of ll" 
        
        prev.next = node
        node.next = current
        return "node positioned at " + position
    
    def searchLL(self, value):
        current = self.head
        position = 1
        if current is None:
            return "Empty List"
        while current:
            if current.value == value:
                return "Found at " + str(position)
            current = current.next
            position+=1
        
        return "Value not found"
    
    def deleteNode(self, value):
        if self.head is None:
            return "Nothing to delete"
        if self.head.value == value:
            self.head = self.head.next
            return "Head deleted"
        
        current = self.head
        prev = None

        while current:
            if current.value == value:
                prev.next = current.next
                return str(value) + " deleted"
            prev = current
            current = current.next
        return "Value not found"
        
    def detectLoop(self):
        if self.head is None:
            return "List empty"
        current = self.head
        position = 1
        prev = None
        node_set = set()
        # I originally used a list but later realized the time in combination
        #  with the while loop this would become O(n^2)
        # I learned that searching set has a O(1) time complexity because it uses
        # a hash-set
        # I'm looking into that right now
        while current:
            if current in node_set:
                return f"Loop detected at position {position}"
            node_set.add(current)
            current = current.next
            position+=1

        return "No loop detected"
            
    def createLoop(self):
        length = self.findLength()
        loop_start = random.randint(1, length)
        
        
    def findLength(self):
        if self.head is None:
            return 0
        count = 1
        current = self.head
        while current:
            current = current.next
            count+=1
        return count

        


        
