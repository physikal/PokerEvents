import { useState } from 'react';
import { Plus, Users, X } from 'lucide-react';
import { PokerEvent, PokerTable, UserInfo } from '../types';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from 'react-hot-toast';

interface TableManagementProps {
  event: PokerEvent;
  participants: UserInfo[];
  currentUserId: string;
  isOwner: boolean;
}

export default function TableManagement({ event, participants, currentUserId, isOwner }: TableManagementProps) {
  const [showAddTable, setShowAddTable] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [newTableSeats, setNewTableSeats] = useState('9');

  const getParticipantName = (userId: string) => {
    const participant = participants.find(p => p.id === userId);
    return participant?.displayName || participant?.email || userId;
  };

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event.tables) return;

    try {
      const newTable: PokerTable = {
        id: `table-${Date.now()}`,
        name: newTableName.trim(),
        maxSeats: Number(newTableSeats),
        reservedSeats: []
      };

      const eventRef = doc(db, 'events', event.id);
      await updateDoc(eventRef, {
        tables: [...event.tables, newTable]
      });

      setShowAddTable(false);
      setNewTableName('');
      setNewTableSeats('9');
      toast.success('Table added successfully');
    } catch (error) {
      console.error('Add table error:', error);
      toast.error('Failed to add table');
    }
  };

  const handleReserveSeat = async (tableId: string, seatNumber: number) => {
    if (!event.tables) return;

    try {
      const table = event.tables.find(t => t.id === tableId);
      if (!table) return;

      // Check if seat is already taken
      if (table.reservedSeats.some(s => s.seatNumber === seatNumber)) {
        toast.error('This seat is already taken');
        return;
      }

      // Check if user already has a seat at this table
      if (table.reservedSeats.some(s => s.playerId === currentUserId)) {
        toast.error('You already have a seat at this table');
        return;
      }

      const updatedTables = event.tables.map(t => {
        if (t.id === tableId) {
          return {
            ...t,
            reservedSeats: [...t.reservedSeats, { seatNumber, playerId: currentUserId }]
          };
        }
        return t;
      });

      const eventRef = doc(db, 'events', event.id);
      await updateDoc(eventRef, { tables: updatedTables });
      toast.success('Seat reserved successfully');
    } catch (error) {
      console.error('Reserve seat error:', error);
      toast.error('Failed to reserve seat');
    }
  };

  const handleReleaseSeat = async (tableId: string, seatNumber: number) => {
    if (!event.tables) return;

    try {
      const updatedTables = event.tables.map(t => {
        if (t.id === tableId) {
          return {
            ...t,
            reservedSeats: t.reservedSeats.filter(s => s.seatNumber !== seatNumber)
          };
        }
        return t;
      });

      const eventRef = doc(db, 'events', event.id);
      await updateDoc(eventRef, { tables: updatedTables });
      toast.success('Seat released successfully');
    } catch (error) {
      console.error('Release seat error:', error);
      toast.error('Failed to release seat');
    }
  };

  const handleRemoveTable = async (tableId: string) => {
    if (!event.tables) return;

    try {
      const updatedTables = event.tables.filter(t => t.id !== tableId);
      const eventRef = doc(db, 'events', event.id);
      await updateDoc(eventRef, { tables: updatedTables });
      toast.success('Table removed successfully');
    } catch (error) {
      console.error('Remove table error:', error);
      toast.error('Failed to remove table');
    }
  };

  if (!event.tables) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users size={20} />
          Table Management
        </h3>
        {isOwner && (
          <button
            onClick={() => setShowAddTable(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Add Table
          </button>
        )}
      </div>

      {showAddTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="card w-full max-w-md relative">
            <button
              onClick={() => setShowAddTable(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold mb-6">Add New Table</h3>

            <form onSubmit={handleAddTable} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Table Name <span className="text-poker-red">*</span>
                </label>
                <input
                  type="text"
                  className="input w-full"
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  placeholder="Main Table"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Number of Seats <span className="text-poker-red">*</span>
                </label>
                <select
                  className="input w-full"
                  value={newTableSeats}
                  onChange={(e) => setNewTableSeats(e.target.value)}
                  required
                >
                  {[6, 7, 8, 9, 10].map(num => (
                    <option key={num} value={num}>{num} seats</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddTable(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {event.tables.map((table) => (
          <div key={table.id} className="card bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold">{table.name}</h4>
              {isOwner && (
                <button
                  onClick={() => handleRemoveTable(table.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {Array.from({ length: table.maxSeats }).map((_, index) => {
                const seatNumber = index + 1;
                const reservation = table.reservedSeats.find(
                  r => r.seatNumber === seatNumber
                );
                const isCurrentUserSeat = reservation?.playerId === currentUserId;

                return (
                  <div
                    key={seatNumber}
                    className={`p-3 rounded-lg ${
                      reservation
                        ? isCurrentUserSeat
                          ? 'bg-poker-red'
                          : 'bg-gray-700'
                        : 'bg-gray-900'
                    }`}
                  >
                    <div className="text-sm font-medium mb-1">
                      Seat {seatNumber}
                    </div>
                    {reservation ? (
                      <>
                        <div className="text-sm truncate">
                          {getParticipantName(reservation.playerId)}
                        </div>
                        {(isOwner || isCurrentUserSeat) && (
                          <button
                            onClick={() => handleReleaseSeat(table.id, seatNumber)}
                            className="text-xs text-red-400 hover:text-red-300 mt-1"
                          >
                            Release
                          </button>
                        )}
                      </>
                    ) : (
                      <button
                        onClick={() => handleReserveSeat(table.id, seatNumber)}
                        className="text-xs text-poker-red hover:text-red-400"
                      >
                        Reserve
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}