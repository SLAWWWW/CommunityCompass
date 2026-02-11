import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, User as UserIcon, Users, ThumbsUp, Heart } from "lucide-react";
import { useLocation, useParams } from "wouter";
import { api } from "@/lib/api";
import type { Group, User } from "@/types";
import { toast } from "sonner";
import { DEMO_USER_ID } from "@/lib/constants";

export default function Profile() {
    const [, navigate] = useLocation();
    const params = useParams<{ userId: string }>();
    const [user, setUser] = useState<User | null>(null);
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);

    const isOwnProfile = params.userId === DEMO_USER_ID;

    useEffect(() => {
        const fetchUserDetails = async () => {
            if (!params.userId) return;

            try {
                // Fetch user data
                const userRes = await api.get<User>(`/api/v1/users/${params.userId}`);
                setUser(userRes.data);

                // Check if current user has liked this user
                setIsLiked(userRes.data.liked_by?.includes(DEMO_USER_ID) || false);

                // Fetch all groups and filter by user membership
                const groupsRes = await api.get<Group[]>("/api/v1/groups/");
                const userGroups = groupsRes.data.filter(group =>
                    group.members.includes(params.userId!)
                );
                setGroups(userGroups);
            } catch (error) {
                console.error("Failed to fetch user details:", error);
                toast.error("Failed to load profile");
            } finally {
                setLoading(false);
            }
        };

        fetchUserDetails();
    }, [params.userId]);

    const handleLike = async () => {
        if (!user || isOwnProfile) return;

        try {
            if (isLiked) {
                await api.post(`/api/v1/users/${user.id}/unlike`);
                setIsLiked(false);
                setUser({ ...user, liked_by: user.liked_by?.filter(id => id !== DEMO_USER_ID) || [] });
                toast.success("Unliked user");
            } else {
                await api.post(`/api/v1/users/${user.id}/like`);
                setIsLiked(true);
                setUser({ ...user, liked_by: [...(user.liked_by || []), DEMO_USER_ID] });
                toast.success("Liked user!");
            }
        } catch (error) {
            console.error("Failed to like/unlike user:", error);
            toast.error("Action failed");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background p-8 overflow-auto">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center border-b border-primary/20 pb-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-primary hover:bg-primary/10"
                            onClick={() => window.history.back()}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <h1 className="text-4xl font-bold font-rajdhani text-primary tracking-wider uppercase drop-shadow-[0_0_10px_rgba(0,204,255,0.4)]">
                            {isOwnProfile ? "My Profile" : "Member Profile"}
                        </h1>
                    </div>

                    {!isOwnProfile && (
                        <Button
                            variant={isLiked ? "secondary" : "outline"}
                            className={`gap-2 ${isLiked ? "bg-red-500/20 border-red-500 text-red-500 hover:bg-red-500/30" : "border-primary/20 text-primary hover:bg-primary/10"}`}
                            onClick={handleLike}
                        >
                            <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                            {isLiked ? "Liked" : "Like"}
                        </Button>
                    )}
                </div>

                {/* Profile Card */}
                <Card className="glass-panel border-primary/10">
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                            <Avatar className="w-32 h-32 border-4 border-primary/50 ring-4 ring-primary/20">
                                <AvatarFallback className="bg-background text-primary text-4xl font-bold">
                                    <UserIcon className="h-16 w-16" />
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 text-center md:text-left space-y-4">
                                <div>
                                    <h2 className="text-3xl font-bold">{user.name}</h2>
                                    <div className="flex items-center gap-2 text-muted-foreground mt-2 justify-center md:justify-start">
                                        <MapPin className="h-4 w-4 text-primary" />
                                        <span>{user.location}</span>
                                    </div>
                                </div>

                                {/* Interests */}
                                <div className="space-y-2">
                                    <div className="text-sm font-semibold text-muted-foreground uppercase">Interests</div>
                                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                        {user.interests?.map((interest, idx) => (
                                            <Badge key={idx} variant="outline" className="border-primary/20 text-primary/80">
                                                {interest}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    <div className="bg-white/5 rounded-lg p-3 text-center border border-white/5">
                                        <div className="text-primary mb-1 flex justify-center"><ThumbsUp size={18} /></div>
                                        <div className="text-2xl font-bold font-rajdhani">{user.liked_by?.length || 0}</div>
                                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Likes Received</div>
                                    </div>
                                    <div className="bg-white/5 rounded-lg p-3 text-center border border-white/5">
                                        <div className="text-secondary mb-1 flex justify-center"><Users size={18} /></div>
                                        <div className="text-2xl font-bold font-rajdhani text-secondary">{groups.length}</div>
                                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Groups Joined</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Groups Section */}
                <Card className="glass-panel border-primary/10">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-primary">Groups</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {groups.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                {isOwnProfile ? "You haven't joined any groups yet." : "This user hasn't joined any groups yet."}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {groups.map((group) => (
                                    <Card
                                        key={group.id}
                                        className="glass-panel border-primary/10 hover:border-primary/40 transition-all cursor-pointer"
                                        onClick={() => navigate(`/waiting-room/${group.id}`)}
                                    >
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg font-bold text-primary">{group.name}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            <p className="text-sm text-muted-foreground line-clamp-2">{group.description}</p>
                                            <div className="flex flex-wrap gap-1">
                                                {group.activity.slice(0, 3).map((tag, idx) => (
                                                    <Badge key={idx} variant="outline" className="text-[10px] border-primary/20 text-primary/80">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                                {group.activity.length > 3 && (
                                                    <Badge variant="outline" className="text-[10px] border-primary/20 text-primary/80">
                                                        +{group.activity.length - 3}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3 text-primary" />
                                                    {group.location}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Users className="h-3 w-3 text-primary" />
                                                    {group.members.length}/{group.max_members}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
