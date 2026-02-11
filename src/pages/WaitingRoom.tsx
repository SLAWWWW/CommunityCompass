import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, MapPin, User as UserIcon, UserPlus, UserMinus } from "lucide-react";
import { useLocation, useParams } from "wouter";
import { api } from "@/lib/api";
import type { Group, User } from "@/types";
import { toast } from "sonner";
import { DEMO_USER_ID } from "@/lib/constants";
import GroupChat from "@/components/GroupChat";

export default function WaitingRoom() {
    const [, navigate] = useLocation();
    const params = useParams<{ groupId: string }>();
    const [group, setGroup] = useState<Group | null>(null);
    const [members, setMembers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isJoining, setIsJoining] = useState(false);
    const [isMember, setIsMember] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    const fetchGroupDetails = async () => {
        if (!params.groupId) return;

        try {
            // Fetch group data, users, and current user in parallel
            const [groupRes, usersRes, currentUserRes] = await Promise.all([
                api.get<Group[]>("/api/v1/groups/"),
                api.get<User[]>("/api/v1/users/"),
                api.get<User>(`/api/v1/users/${DEMO_USER_ID}`)
            ]);

            const foundGroup = groupRes.data.find(g => g.id === params.groupId);

            if (!foundGroup) {
                toast.error("Group not found");
                navigate("/groups");
                return;
            }

            setGroup(foundGroup);
            setIsMember(foundGroup.members.includes(DEMO_USER_ID));
            setCurrentUser(currentUserRes.data);

            // Filter group members
            const groupMembers = usersRes.data.filter(user =>
                foundGroup.members.includes(user.id)
            );
            setMembers(groupMembers);
        } catch (error) {
            console.error("Failed to fetch group details:", error);
            toast.error("Failed to load group");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroupDetails();
    }, [params.groupId, navigate]);

    const handleJoinLeave = async () => {
        if (!group || isJoining) return;

        setIsJoining(true);
        try {
            if (isMember) {
                // Leave group
                await api.post(`/api/v1/groups/${group.id}/leave`);
                toast.success("Left group");
            } else {
                // Join group
                await api.post(`/api/v1/groups/${group.id}/join`);
                toast.success("Joined group!");
            }
            // Refresh group data
            await fetchGroupDetails();
        } catch (error: any) {
            console.error("Failed to join/leave group:", error);
            toast.error(error.response?.data?.detail || "Action failed");
        } finally {
            setIsJoining(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!group) {
        return null;
    }

    const isAdmin = group.admin_id === DEMO_USER_ID;
    const isFull = group.members.length >= group.max_members;

    return (
        <div className="min-h-screen bg-background p-8 overflow-auto">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center border-b border-primary/20 pb-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-primary hover:bg-primary/10"
                            onClick={() => navigate("/groups")}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-4xl font-bold font-rajdhani text-primary tracking-wider uppercase drop-shadow-[0_0_10px_rgba(0,204,255,0.4)]">
                                {group.name}
                            </h1>
                            <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
                        </div>
                    </div>
                    <Button
                        onClick={handleJoinLeave}
                        disabled={isJoining || isAdmin || (!isMember && isFull)}
                        className={`gap-2 ${isMember
                            ? "bg-red-500/20 border-red-500 text-red-500 hover:bg-red-500/30"
                            : "bg-primary text-black hover:bg-primary/90"
                            }`}
                        variant={isMember ? "outline" : "default"}
                    >
                        {isJoining ? (
                            "Loading..."
                        ) : isMember ? (
                            <>
                                <UserMinus className="w-4 h-4" />
                                Leave Group
                            </>
                        ) : (
                            <>
                                <UserPlus className="w-4 h-4" />
                                {isFull ? "Group Full" : "Join Group"}
                            </>
                        )}
                    </Button>
                </div>

                {/* Group Info */}
                <Card className="glass-panel border-primary/10">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-primary">Group Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                            {group.activity.map((tag, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs border-primary/20 text-primary/80">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-primary" />
                                <span>{group.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-primary" />
                                <span>{group.members.length} / {group.max_members} Members</span>
                            </div>
                            <Badge variant="secondary" className="text-xs">{group.age_group}</Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Two Column Layout: Members + Chat */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Members Grid - Takes 2 columns on large screens */}
                    <div className="lg:col-span-2">
                        <Card className="glass-panel border-primary/10">
                            <CardHeader>
                                <CardTitle className="text-xl font-bold text-primary flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    Members ({members.length}/{group.max_members})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {members.map((member) => (
                                        <Card
                                            key={member.id}
                                            className="glass-panel border-primary/10 hover:border-primary/40 transition-all cursor-pointer"
                                            onClick={() => navigate(`/profile/${member.id}`)}
                                        >
                                            <CardContent className="p-4 flex flex-col items-center gap-3">
                                                <Avatar className="w-16 h-16 border-2 border-primary/50">
                                                    <AvatarFallback className="bg-background text-primary text-lg font-bold">
                                                        <UserIcon className="h-8 w-8" />
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="text-center w-full">
                                                    <h3 className="font-bold text-sm truncate">{member.name}</h3>
                                                    <p className="text-xs text-muted-foreground truncate">{member.location}</p>
                                                    {member.id === group.admin_id && (
                                                        <Badge variant="secondary" className="text-[10px] mt-2">Admin</Badge>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}

                                    {/* Empty slots */}
                                    {Array.from({ length: group.max_members - members.length }).map((_, idx) => (
                                        <Card
                                            key={`empty-${idx}`}
                                            className="glass-panel border-primary/5 border-dashed"
                                        >
                                            <CardContent className="p-4 flex flex-col items-center justify-center gap-3 min-h-[140px]">
                                                <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center">
                                                    <Users className="w-6 h-6 text-primary/30" />
                                                </div>
                                                <span className="text-xs text-muted-foreground">Open Slot</span>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Chat - Takes 1 column on large screens */}
                    <div className="lg:col-span-1">
                        {currentUser && (
                            <div className="h-[600px]">
                                <GroupChat groupId={group.id} currentUser={currentUser} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
