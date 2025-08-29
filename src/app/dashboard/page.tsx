"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

interface Project {
    id: string;
    name: string;
    projectKey?: string;
    projectManager?: string;
    overallProgress: number;
    implementationProgress: number;
    lastUpdated: string;
    teamProgress?: {
        connect?: string;
        d365?: string;
        boomi?: string;
        bi?: string;
        bbv?: string;
    };
    customFields?: {
        completion?: string;
    };
}

interface List {
    id: string;
    name: string;
    description: string;
    type: string;
    filterCriteria: unknown[];
    viewConfigId: string;
}

interface ListsResponse {
    lists: List[];
    scenarios: unknown[];
    portfolios: unknown[];
}

export default function Dashboard() {
    const [items, setItems] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredItems, setFilteredItems] = useState<Project[]>([]);
    const [lists, setLists] = useState<List[]>([]);
    const [selectedList, setSelectedList] = useState<string>("all");

    const fetchProjects = async (listId?: string) => {
        try {
            setLoading(true);
            setError(null);
            
            const url = listId && listId !== 'all' 
                ? `/api/meisterplan/projects?listId=${listId}`
                : '/api/meisterplan/projects';
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            // Handle both old and new API response formats
            const projects = result.items || result || [];
            
            if (Array.isArray(projects)) {
                setItems(projects);
                setFilteredItems(projects);
            } else {
                console.error('Unexpected API response format:', result);
                setItems([]);
                setFilteredItems([]);
            }
            
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            console.error('Error fetching projects:', err);
            setError(errorMessage);
            setItems([]);
            setFilteredItems([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchLists = async () => {
        try {
            const response = await fetch('/api/meisterplan/lists');
            if (response.ok) {
                const data: ListsResponse = await response.json();
                setLists(data.lists);
            }
        } catch (err: unknown) {
            console.error('Fehler beim Laden der Listen:', err);
        }
    };

    useEffect(() => {
        fetchProjects();
        fetchLists();
    }, []);

    useEffect(() => {
        if (selectedList !== "all") {
            fetchProjects(selectedList);
        } else {
            // Bei "Alle Projekte" alle geladenen Projekte anzeigen
            setFilteredItems(items);
        }
    }, [selectedList, items]);

    // Filter items based on search term
    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredItems(items);
        } else {
            const filtered = items.filter(item =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.projectKey?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.projectManager?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredItems(filtered);
        }
    }, [searchTerm, items]);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#000000', color: '#ffffff' }}>
                <header style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    backgroundColor: '#111827',
                    borderBottom: '1px solid #374151',
                    padding: '16px 0'
                }}>
                    <div style={{
                        maxWidth: '1280px',
                        margin: '0 auto',
                        padding: '0 24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ width: '200px', height: '32px', backgroundColor: '#374151', borderRadius: '4px' }}></div>
                        <div style={{ width: '128px', height: '16px', backgroundColor: '#374151', borderRadius: '4px' }}></div>
                    </div>
                </header>

                <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>
                    <div style={{
                        display: 'grid',
                        gap: '16px',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
                    }}>
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} style={{
                                borderRadius: '16px',
                                border: '1px solid #374151',
                                backgroundColor: '#1f2937',
                                padding: '20px',
                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                            }}>
                                <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ width: '128px', height: '20px', backgroundColor: '#374151', borderRadius: '4px' }}></div>
                                    <div style={{ width: '48px', height: '16px', backgroundColor: '#374151', borderRadius: '4px' }}></div>
                                </div>
                                <div style={{ width: '100%', height: '8px', backgroundColor: '#374151', borderRadius: '4px' }}></div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                minHeight: '100vh',
                backgroundColor: '#000000',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Fehler beim Laden der Projekte</h2>
                    <p style={{ color: '#9ca3af', maxWidth: '448px', marginBottom: '16px' }}>{error}</p>
                    <button
                        onClick={() => fetchProjects()}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 16px',
                            backgroundColor: '#1f2937',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        Erneut versuchen
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#000000', color: '#ffffff' }}>
            <header style={{
                position: 'sticky',
                top: 0,
                zIndex: 10,
                backgroundColor: '#111827',
                borderBottom: '1px solid #374151',
                backdropFilter: 'blur(10px)'
            }}>
                <div style={{
                    padding: '16px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: '600', margin: 0 }}>SAG Digital</h1>
                    </div>
                    <button
                        onClick={() => {
                            document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                            window.location.href = '/login';
                        }}
                        style={{
                            padding: '8px 16px',
                            fontSize: '14px',
                            backgroundColor: '#dc2626',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                    >
                        Logout
                    </button>
                </div>
            </header>

            <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>
                {/* Listen-Auswahl */}
                {lists.length > 0 && (
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#9ca3af',
                            marginBottom: '8px'
                        }}>
                            Select list:
                        </label>
                        <select
                            value={selectedList}
                            onChange={(e) => setSelectedList(e.target.value)}
                            style={{
                                padding: '8px 12px',
                                fontSize: '14px',
                                backgroundColor: '#1f2937',
                                border: '1px solid #374151',
                                borderRadius: '6px',
                                color: '#ffffff',
                                outline: 'none',
                                minWidth: '200px'
                            }}
                        >
                            <option value="all">All Projects</option>
                            {lists.map((list) => (
                                <option key={list.id} value={list.id}>
                                    {list.name}
                                </option>
                            ))}
                        </select>
                        {selectedList !== "all" && (
                            <p style={{
                                fontSize: '12px',
                                color: '#6b7280',
                                marginTop: '4px'
                            }}>
                                {lists.find(l => l.id === selectedList)?.description}
                            </p>
                        )}
                    </div>
                )}

                {/* Search Bar */}
                <div style={{ marginBottom: '24px' }}>
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={(e) => e.target.placeholder = ""}
                        onBlur={(e) => e.target.placeholder = searchTerm ? "" : "Search"}
                        style={{
                            maxWidth: '400px',
                            padding: '12px 16px',
                            fontSize: '16px',
                            backgroundColor: '#1f2937',
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            color: '#ffffff',
                            outline: 'none'
                        }}
                    />
                    <div style={{ marginTop: '8px', fontSize: '14px', color: '#9ca3af' }}>
                        {filteredItems?.length || 0} of {items?.length || 0} projects displayed
                    </div>
                </div>

                {filteredItems.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                        <p style={{ color: '#9ca3af' }}>
                            {searchTerm ? `No projects found for "${searchTerm}"` : 'No projects found.'}
                        </p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gap: '24px',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))'
                    }}>
                        <AnimatePresence>
                            {filteredItems.map((project, idx) => (
                                <motion.div key={project.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.35, delay: idx * 0.03 }}
                                >
                                    <Card style={{
                                        borderRadius: '8px',
                                        backgroundColor: '#1f2937',
                                        padding: '20px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        transition: 'all 0.2s ease'
                                    }}>
                                        <CardContent style={{ padding: 0 }}>
                                            <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <h2 style={{
                                                        fontSize: '18px',
                                                        fontWeight: '500',
                                                        margin: '0 0 8px 0',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}>
                                                        {project.name}
                                                    </h2>
                                                    {project.projectKey && (
                                                        <p style={{
                                                            fontSize: '12px',
                                                            color: '#6b7280',
                                                            fontFamily: 'monospace',
                                                            margin: '0 0 4px 0'
                                                        }}>
                                                            <a
                                                                href={`https://eu.meisterplan.com/1d7330e8-sandbox/projects?dateRange=before-12-after-12&scenarioId=7a36777f-00d7-dd0b-2468-95aa94f90e63&compareScenarioId=none&portfolioId=d918f9c9-86d3-4e77-8d96-d6523111abfa&viewConfigId=079ff479-e71c-4c89-a986-02f744c718aa&projectId=${project.id}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                style={{
                                                                    color: '#3b82f6',
                                                                    textDecoration: 'none',
                                                                    cursor: 'pointer'
                                                                }}
                                                                onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                                                                onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                                                            >
                                                                {project.projectKey}
                                                            </a>
                                                        </p>
                                                    )}
                                                    {project.projectManager && (
                                                        <div style={{ 
                                                            display: 'flex', 
                                                            justifyContent: 'space-between', 
                                                            alignItems: 'center',
                                                            marginBottom: '8px'
                                                        }}>
                                                            <span style={{ 
                                                                fontSize: '14px',
                                                                color: '#9ca3af',
                                                                fontWeight: '500'
                                                            }}>
                                                                Project Manager: {project.projectManager}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <p style={{ fontSize: '12px', color: '#6b7280' }}>
                                                        Last updated: {project.lastUpdated}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            {/* Progress Bars */}
                                            <div style={{ marginTop: '16px' }}>
                                                {/* Overall Progress Bar - only show if overallProgress has a value */}
                                                {project.overallProgress !== null && (
                                                    <div style={{ marginBottom: '12px' }}>
                                                        <div style={{ 
                                                            display: 'flex', 
                                                            justifyContent: 'space-between', 
                                                            alignItems: 'center',
                                                            marginBottom: '4px'
                                                        }}>
                                                            <span style={{ 
                                                                fontSize: '12px',
                                                                color: '#9ca3af',
                                                                fontWeight: '500'
                                                            }}>
                                                                Overall Progress
                                                            </span>
                                                            <span style={{ 
                                                                fontSize: '12px',
                                                                color: '#9ca3af',
                                                                fontWeight: '500'
                                                            }}>
                                                                {project.overallProgress}%
                                                            </span>
                                                        </div>
                                                        <div style={{
                                                            width: '100%',
                                                            height: '8px',
                                                            backgroundColor: '#374151',
                                                            borderRadius: '4px',
                                                            overflow: 'hidden'
                                                        }}>
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${project.overallProgress}%` }}
                                                                transition={{ duration: 1, ease: "easeOut" }}
                                                                style={{
                                                                    height: '100%',
                                                                    backgroundColor: '#10b981',
                                                                    borderRadius: '4px'
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Team Progress Bars - only show if they have values */}
                                                {project.teamProgress && (
                                                    <>
                                                        {/* Connect Progress */}
                                                        {project.teamProgress.connect && (
                                                            <div style={{ marginBottom: '12px' }}>
                                                                <div style={{
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center',
                                                                    marginBottom: '4px'
                                                                }}>
                                                                    <span style={{
                                                                        fontSize: '12px',
                                                                        color: '#9ca3af',
                                                                        fontWeight: '500'
                                                                    }}>Connect</span>
                                                                    <span style={{
                                                                        fontSize: '12px',
                                                                        color: '#9ca3af',
                                                                        fontWeight: '500'
                                                                    }}>{project.teamProgress.connect}</span>
                                                                </div>
                                                                <div style={{
                                                                    width: '100%',
                                                                    height: '6px',
                                                                    backgroundColor: '#374151',
                                                                    borderRadius: '3px',
                                                                    overflow: 'hidden'
                                                                }}>
                                                                    <motion.div
                                                                        initial={{ width: 0 }}
                                                                        animate={{ width: project.teamProgress.connect?.replace('%', '') + '%' }}
                                                                        transition={{ duration: 1, ease: "easeOut" }}
                                                                        style={{
                                                                            height: '100%',
                                                                            backgroundColor: '#3b82f6',
                                                                            borderRadius: '3px'
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* D365 Progress */}
                                                        {project.teamProgress.d365 && (
                                                            <div style={{ marginBottom: '12px' }}>
                                                                <div style={{
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center',
                                                                    marginBottom: '4px'
                                                                }}>
                                                                    <span style={{
                                                                        fontSize: '12px',
                                                                        color: '#9ca3af',
                                                                        fontWeight: '500'
                                                                    }}>Dynamics</span>
                                                                    <span style={{
                                                                        fontSize: '12px',
                                                                        color: '#9ca3af',
                                                                        fontWeight: '500'
                                                                    }}>{project.teamProgress.d365}</span>
                                                                </div>
                                                                <div style={{
                                                                    width: '100%',
                                                                    height: '6px',
                                                                    backgroundColor: '#374151',
                                                                    borderRadius: '3px',
                                                                    overflow: 'hidden'
                                                                }}>
                                                                    <motion.div
                                                                        initial={{ width: 0 }}
                                                                        animate={{ width: project.teamProgress.d365?.replace('%', '') + '%' }}
                                                                        transition={{ duration: 1, ease: "easeOut" }}
                                                                        style={{
                                                                            height: '100%',
                                                                            backgroundColor: '#8b5cf6',
                                                                            borderRadius: '3px'
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Boomi Progress */}
                                                        {project.teamProgress.boomi && (
                                                            <div style={{ marginBottom: '12px' }}>
                                                                <div style={{
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center',
                                                                    marginBottom: '4px'
                                                                }}>
                                                                    <span style={{
                                                                        fontSize: '12px',
                                                                        color: '#9ca3af',
                                                                        fontWeight: '500'
                                                                    }}>Boomi</span>
                                                                    <span style={{
                                                                        fontSize: '12px',
                                                                        color: '#9ca3af',
                                                                        fontWeight: '500'
                                                                    }}>{project.teamProgress.boomi}</span>
                                                                </div>
                                                                <div style={{
                                                                    width: '100%',
                                                                    height: '6px',
                                                                    backgroundColor: '#374151',
                                                                    borderRadius: '3px',
                                                                    overflow: 'hidden'
                                                                }}>
                                                                    <motion.div
                                                                        initial={{ width: 0 }}
                                                                        animate={{ width: project.teamProgress.boomi?.replace('%', '') + '%' }}
                                                                        transition={{ duration: 1, ease: "easeOut" }}
                                                                        style={{
                                                                            height: '100%',
                                                                            backgroundColor: '#f59e0b',
                                                                            borderRadius: '3px'
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* BI Progress */}
                                                        {project.teamProgress.bi && (
                                                            <div style={{ marginBottom: '12px' }}>
                                                                <div style={{
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center',
                                                                    marginBottom: '4px'
                                                                }}>
                                                                    <span style={{
                                                                        fontSize: '12px',
                                                                        color: '#9ca3af',
                                                                        fontWeight: '500'
                                                                    }}>Datawarehouse</span>
                                                                    <span style={{
                                                                        fontSize: '12px',
                                                                        color: '#9ca3af',
                                                                        fontWeight: '500'
                                                                    }}>{project.teamProgress.bi}</span>
                                                                </div>
                                                                <div style={{
                                                                    width: '100%',
                                                                    height: '6px',
                                                                    backgroundColor: '#374151',
                                                                    borderRadius: '3px',
                                                                    overflow: 'hidden'
                                                                }}>
                                                                    <motion.div
                                                                        initial={{ width: 0 }}
                                                                        animate={{ width: project.teamProgress.bi?.replace('%', '') + '%' }}
                                                                        transition={{ duration: 1, ease: "easeOut" }}
                                                                        style={{
                                                                            height: '100%',
                                                                            backgroundColor: '#06b6d4',
                                                                            borderRadius: '3px'
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* BBV Progress */}
                                                        {project.teamProgress.bbv && (
                                                            <div style={{ marginBottom: '12px' }}>
                                                                <div style={{
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center',
                                                                    marginBottom: '4px'
                                                                }}>
                                                                    <span style={{
                                                                        fontSize: '12px',
                                                                        color: '#9ca3af',
                                                                        fontWeight: '500'
                                                                    }}>Middleware</span>
                                                                    <span style={{
                                                                        fontSize: '12px',
                                                                        color: '#9ca3af',
                                                                        fontWeight: '500'
                                                                    }}>{project.teamProgress.bbv}</span>
                                                                </div>
                                                                <div style={{
                                                                    width: '100%',
                                                                    height: '6px',
                                                                    backgroundColor: '#374151',
                                                                    borderRadius: '3px',
                                                                    overflow: 'hidden'
                                                                }}>
                                                                    <motion.div
                                                                        initial={{ width: 0 }}
                                                                        animate={{ width: project.teamProgress.bbv?.replace('%', '') + '%' }}
                                                                        transition={{ duration: 1, ease: "easeOut" }}
                                                                        style={{
                                                                            height: '100%',
                                                                            backgroundColor: '#ec4899',
                                                                            borderRadius: '3px'
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </>
                                                )}

                                                {/* Implementation Progress Bar - only show if it has a value */}
                                                {project.implementationProgress !== null && (
                                                    <div style={{ marginBottom: '12px' }}>
                                                        <div style={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            marginBottom: '4px'
                                                        }}>
                                                            <span style={{
                                                                fontSize: '12px',
                                                                color: '#9ca3af',
                                                                fontWeight: '500'
                                                            }}>Implementation Progress</span>
                                                            <span style={{
                                                                fontSize: '12px',
                                                                color: '#9ca3af',
                                                                fontWeight: '500'
                                                            }}>{project.implementationProgress}%</span>
                                                        </div>
                                                        <div style={{
                                                            width: '100%',
                                                            height: '8px',
                                                            backgroundColor: '#374151',
                                                            borderRadius: '4px',
                                                            overflow: 'hidden'
                                                        }}>
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${project.implementationProgress}%` }}
                                                                transition={{ duration: 1, ease: "easeOut" }}
                                                                style={{
                                                                    height: '100%',
                                                                    backgroundColor: '#f59e0b',
                                                                    borderRadius: '4px'
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </main>
        </div>
    );
}
